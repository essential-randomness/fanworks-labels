{
  description = "Fanworks Labeler";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
    mk-node-package = {
      url = "github:winston0410/mkNodePackage";
      inputs = {
        flake-utils.follows = "flake-utils";
        nixpkgs.follows = "nixpkgs";
      };
    };
  };

  outputs = { self, nixpkgs, flake-utils, ... } @ inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
          pkgs = nixpkgs.legacyPackages.${system};
          mkNodePackage = mk-node-package.lib."${system}".mkNodePackage;
      in {
        packages = rec {
          fanworkssite-assets = mkNodePackage {
            name="labels website";
            version="0.0.1";
            src = ./.;
            dontFixup = true;
            doDist = false;
            buildPhase = ''
              export ASTRO_DATABASE_FILE="/var/lib/fanworkssite/site.sql"
              npm run build
            '';
            installPhase = ''
              mkdir -p $out/libexec/fanworkssite
              mv node_modules $out/libexec/fanworkssite/
              mv deps $out/libexec/fanworkssite/
            '';
            preFixup = ''
              ${lib.getExe gnused} -E "s_file://.+/dist/_file://$out/_" $out/server/entry.mjs -i
            '';
          };

          # TODO: swap with wrapProgram 
          fanworkssite = pkgs.writeShellScriptBin "fanworkssite" ''
            export NODE_PATH=${fanworkssite-assets}/libexec/fanworkssite/node_modules
            export NODE_ENV=production

            exec ${pkgs.nodejs}/bin/node -r dotenv/config ${fanworkssite-assets}/libexec/fanworkssite/dist/server/entry.mjs
          '';
          default = fanworkssite;
        };
      }
    );
}