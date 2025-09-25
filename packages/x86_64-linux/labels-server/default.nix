{
  lib,
  writeScriptBin,
  buildNpmPackage,
  nodejs_22,
  makeWrapper,
  importNpmLock,
  ...
}:  let
    package-json = lib.importJSON (lib.snowfall.fs.get-file "./labels-server/package.json");
    labels = lib.snowfall.fs.get-file "./labels.ts";
in
  buildNpmPackage {
    pname = "fanworks-labels-server";
	inherit (package-json) version;
	
    src = lib.snowfall.fs.get-file "./labels-server";

    npmDeps = importNpmLock {
    	npmRoot = lib.snowfall.fs.get-file "./labels-server";
    };

    npmConfigHook = importNpmLock.npmConfigHook;

    npmFlags = [ "--ignore-scripts" ];

    nodejs = nodejs_22;

    dontNpmBuild = true;

    nativeBuildInputs = [makeWrapper];

	postUnpack = ''
		cp --no-preserve=mode ${labels} $sourceRoot/src/labels.ts
	'';

    postInstall = ''
      makeWrapper ${nodejs_22}/bin/node $out/bin/fanworks-labels-server --add-flags $out/lib/node_modules/labels-server/node_modules/.bin/tsx --add-flags $out/lib/node_modules/labels-server/src/index.ts
    '';
  }
