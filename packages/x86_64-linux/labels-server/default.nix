{
  lib,
  writeScriptBin,
  buildNpmPackage,
  nodejs_22,
  makeWrapper,
  ...
}:  let
  package-json = lib.importJSON (lib.snowfall.fs.get-file "./labels-server/package.json");
in
  buildNpmPackage {
    pname = "fanworks-labels-server";
    inherit (package-json) version;

    src = lib.snowfall.fs.get-file "/labels-server/";
    
    npmDepsHash = "sha256-EIHnbYWrSkRiE5s1xpu4rK3rzefDtWwCg4XiGhfvf4Y=";

    nodejs = nodejs_22;

    dontNpmBuild = true;

    nativeBuildInputs = [makeWrapper];

    postInstall = ''
      makeWrapper ${nodejs_22}/bin/node $out/bin/fanworks-labels-server --add-flags $out/lib/node_modules/labels-server/node_modules/.bin/tsx --add-flags $out/lib/node_modules/labels-server/src/index.ts
    '';
  }
