{
    lib,
    pkgs,
    inputs,

    namespace, # The namespace used for your flake, defaulting to "internal" if not set.
    system, # The system architecture for this host (eg. `x86_64-linux`).
    target, # The Snowfall Lib target for this system (eg. `x86_64-iso`).
    format, # A normalized name for the system target (eg. `iso`).
    virtual, # A boolean to determine whether this system is a virtual target using nixos-generators.
    systems, # An attribute map of your defined hosts.

    config,
    ...
}:
let
    inherit (builtins) toString;
    inherit (lib) types mkIf mkOption mkDefault;
    inherit (lib) optional optionals optionalAttrs optionalString;
    cfg = config.services.fanworks-labels-server;
in {
    options.services.fanworks-labels-server = {
        enable =
            lib.mkEnableOption "Fanworks feeds labels server"; 

        host = mkOption {
            type = types.str;
            description = "The public host name to serve.";
            example = "fanworksfeeds.fujocoded.com/";
        };

        port = mkOption {
            type = types.port;
            default = 14833;
            description = "The port the labels server should listen on.";
        };

        signingKeyFile = mkOption {
            ##
            # DO NOT USE types.path! It pulls the file into the Nix Store and
            # this should stay a secret no one but us knows.
            ##
            type = types.str;
            description = ''
              Path to a file containing the private signing key for the labeler.
            '';
        };

        stateDir = mkOption {
            type = types.str;
            default = "/var/lib/fanworks-labels-server";
            description = ''
                Where the database and cursor will be saved.
            '';
        };

        user = mkOption {
            type = types.str;
            default = "fanworks-labels-server";
            description = "User under which fanworks-labels-server is ran.";
        };

        group = mkOption {
            type = types.str;
            default = "fanworks-labels-server";
            description = "Group under which fanworks-labels-server is ran.";
        };

        package = mkOption {
            type = types.package;
            default = pkgs.${namespace}.fanworks-labels-server;
            description = "The labeler package to run";
        };
    };
  
    config = mkIf cfg.enable {
        users = {
            users = optionalAttrs (cfg.user == "fanworks-labels-server") {
                fujin-bsky-labeler = {
                    group = cfg.group;
                    home = cfg.stateDir;
                    isSystemUser = true;
                };
            };

            groups =
                optionalAttrs (cfg.group == "fanworks-labels-server") { fanworks-labels-server = { }; };
        };

        systemd.services.fanworks-labels-server = {
            after = [ "network.target" ];
            wantedBy = [ "multi-user.target" ];

            serviceConfig = {
                Type = "simple";
                User = cfg.user;
                Group = cfg.group;
                WorkingDirectory = cfg.stateDir;
                Restart = "always";
                RestartSec = 20;
            };

            environment = {
                LABELER_DB_PATH =  "${cfg.stateDir}/labeler.db";
            };

            # this is where we can write a bash script to do everything we need 
            script = ''
                if ! test -f "${cfg.signingKeyFile}"; then
                  echo "Your signing key file is missing!"
                  exit 1
                fi

                export SIGNING_KEY="$(cat ${cfg.signingKeyFile})"
                exec ${cfg.package}/bin/fanworks-labels-server
            '';
        };

        services.nginx.virtualHosts."${cfg.host}" = {
            enableACME = true;
            forceSSL = true;
        
            locations."/" = {
                proxyWebsockets = true;
                proxyPass = "http://127.0.0.1:${toString cfg.port}";
            };
        }; 
    };
}
