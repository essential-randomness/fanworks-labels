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
    package-json = lib.importJSON (lib.snowfall.fs.get-file "./feed-server/package.json");
    labels = lib.snowfall.fs.get-file "./labels.ts";
    nodejs = nodejs_22;
    buildNpmPackageForNode = buildNpmPackage.override { inherit nodejs; };
    importNpmLockForNode = pkgs.callPackages (pkgs.path + "/pkgs/build-support/node/import-npm-lock") {
      callPackages = pkgs.lib.callPackagesWith (pkgs // { inherit nodejs; });
    };
in
  buildNpmPackageForNode {
    pname = "fanworks-feed-server";
	inherit (package-json) version;
	
    src = lib.snowfall.fs.get-file "./feed-server";

    npmDeps = importNpmLockForNode {
    	npmRoot = lib.snowfall.fs.get-file "./feed-server";
    };

    npmConfigHook = importNpmLockForNode.npmConfigHook;

    inherit nodejs;

    dontNpmBuild = true;

    nativeBuildInputs = [makeWrapper];

	postUnpack = ''
		cp --no-preserve=mode --remove-destination ${labels} $sourceRoot/labels.ts
	'';

    postInstall = ''
      makeWrapper ${nodejs}/bin/node $out/bin/fanworks-feed-server --add-flags $out/lib/node_modules/feed-server/node_modules/.bin/tsx --add-flags $out/lib/node_modules/feed-server/src/index.ts
    '';
  }
