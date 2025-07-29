{
  lib,
  writeScriptBin,
  buildNpmPackage,
  nodejs_22,
  makeWrapper,
  importNpmLock,
  ...
}:  let
    package-json = lib.importJSON (lib.snowfall.fs.get-file "./labeling-site/package.json");
    labels = lib.snowfall.fs.get-file "./labels.ts";
in
  buildNpmPackage {
    pname = "fanworks-labeling-site";
	inherit (package-json) version;
	
    src = lib.snowfall.fs.get-file "./labeling-site";

    npmDeps = importNpmLock {
    	npmRoot = lib.snowfall.fs.get-file "./labeling-site";
    };

    npmConfigHook = importNpmLock.npmConfigHook;

    npmFlags = [ "--ignore-scripts" "--legacy-peer-deps" ];

    nodejs = nodejs_22;

    # dontNpmBuild = true;

    nativeBuildInputs = [makeWrapper];

	postUnpack = ''
		cp --no-preserve=mode ${labels} $sourceRoot/src/labels.ts
	'';

    postInstall = ''
      makeWrapper ${nodejs_22}/bin/node $out/bin/fanworks-labeling-site labelfanworks.fujocoded.com --add-flags $out/lib/node_modules/labeling-site/./dist/server/entry.mjs"
    '';
  }
