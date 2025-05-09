{
  description = "fanworks labels";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";
    fanworks-labels.url = "github:essential-randomness/fanworks-labels";

    snowfall-lib = {
      url = "github:snowfallorg/lib";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    snowfall-flake = {
			url = "github:snowfallorg/flake";
      # Instead of using its version of packages it uses the one that we have in inputs
			inputs.nixpkgs.follows = "nixpkgs";
		};
  };

  outputs = inputs:
    inputs.snowfall-lib.mkFlake {
      inherit inputs;

      src = ./.;
       
      systems.modules.nixos = with inputs; [
         fanworks-labels.nixosModules.fanworks-labels
      ];
  };
}
