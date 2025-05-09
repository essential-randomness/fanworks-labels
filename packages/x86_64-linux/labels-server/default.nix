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
    
    npmDepsHash = "sha256-FjmQNZc0SzLxq6AlCc/JrY/oKV2RoNE64G1Kk68F//w=";

    nodejs = nodejs_22;

    dontNpmBuild = true;

    nativeBuildInputs = [makeWrapper];

    postInstall = ''
      makeWrapper ${nodejs_22}/bin/node $out/bin/fanworks-labels-server --add-flags $out/lib/node_modules/fanworks-labels-server/node_modules/.bin/tsx --add-flags $out/lib/node_modules/fanworks-labels-server/src/index.ts
    '';
  }
