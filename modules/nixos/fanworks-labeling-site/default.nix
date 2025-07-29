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
    cfg = config.services.fanworks-labeling-site;
in {
    options.services.fanworks-labeling-site = {
        enable =
            lib.mkEnableOption "Fanworks feeds labeling site"; 

        host = mkOption {
            type = types.str;
            description = "The public host name to serve.";
            example = "labelfanworks.fujocoded.com/";
        };

        port = mkOption {
            type = types.port;
            default = 14831;
            description = "The port the labeling site should listen on.";
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
            description = "User under which fanworks-labeling-site is ran.";
        };

        group = mkOption {
            type = types.str;
            default = "fanworks-labels-server";
            description = "Group under which fanworks-labeling-site is ran.";
        };

        package = mkOption {
            type = types.package;
            default = pkgs.${namespace}.labeling-site;
            description = "The labeling site package to run";
        };
    };
  
    config = mkIf cfg.enable {
        users = {
            users = optionalAttrs (cfg.user == "fanworks-labeling-site") {
                fanworks-labeling-server = {
                    group = cfg.group;
                    home = cfg.stateDir;
                    isSystemUser = true;
                };
            };

            groups =
                optionalAttrs (cfg.group == "fanworks-labeling-site") { fanworks-labeling-site = { }; };
        };

        systemd.services.fanworks-labeling-site = {
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
                LABELER_DB_PATH =  "${cfg.stateDir}/feed.sqlite";
                __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = "labelfanworks.fujocoded.com";
                PUBLIC_URL = "labelfanworks.fujocoded.com";
            };

            # this is where we can write a bash script to do everything we need 
            script = ''
                __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=labelfanworks.fujocoded.com
                PUBLIC_URL=labelfanworks.fujocoded.com
                exec ${cfg.package}/bin/fanworks-labeling-site
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
