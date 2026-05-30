{
  lib,
  pkgs,
  writeScriptBin,
  buildNpmPackage,
  nodejs_22,
  makeWrapper,
  importNpmLock,
  ...
}:  let
    package-json = lib.importJSON (lib.snowfall.fs.get-file "./labeling-site/package.json");
    labels = lib.snowfall.fs.get-file "./labels.ts";
    nodejs = nodejs_22;
    buildNpmPackageForNode = buildNpmPackage.override { inherit nodejs; };
    importNpmLockForNode = pkgs.callPackages (pkgs.path + "/pkgs/build-support/node/import-npm-lock") {
      callPackages = pkgs.lib.callPackagesWith (pkgs // { inherit nodejs; });
    };
in
  buildNpmPackageForNode {
    pname = "fanworks-labeling-site";
	inherit (package-json) version;
	
    src = lib.snowfall.fs.get-file "./labeling-site";

    npmDeps = importNpmLockForNode {
    	npmRoot = lib.snowfall.fs.get-file "./labeling-site";
    };

    npmConfigHook = importNpmLockForNode.npmConfigHook;

    npmFlags = [ "--ignore-scripts" "--legacy-peer-deps" ];

    inherit nodejs;

    # dontNpmBuild = true;

    nativeBuildInputs = [makeWrapper];

	postUnpack = ''
		cp --no-preserve=mode ${labels} $sourceRoot/src/labels.ts
	'';

    postInstall = ''
      makeWrapper ${nodejs}/bin/node $out/bin/fanworks-labeling-site --add-flags $out/lib/node_modules/labeling-site/./dist/server/entry.mjs
    '';
  }
