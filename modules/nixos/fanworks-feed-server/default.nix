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
    cfg = config.services.fanworks-feed-server;
in {
    options.services.fanworks-feed-server = {
        enable =
            lib.mkEnableOption "Fanworks feeds feed-server"; 

        host = mkOption {
            type = types.str;
            description = "The public host name to serve.";
            example = "fanworksfeeds.fujocoded.com/";
        };

        port = mkOption {
            type = types.port;
            default = 14833;
            description = "The port the feed server should listen on.";
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
            description = "User under which fanworks-feed-server is ran.";
        };

        group = mkOption {
            type = types.str;
            default = "fanworks-labels-server";
            description = "Group under which fanworks-feed-server is ran.";
        };

        package = mkOption {
            type = types.package;
            default = pkgs.${namespace}.feed-server;
            description = "The feed package to run";
        };
    };
  
    config = mkIf cfg.enable {
        users = {
            users = optionalAttrs (cfg.user == "fanworks-labels-server") {
                fanworks-labels-server = {
                    group = cfg.group;
                    home = cfg.stateDir;
                    isSystemUser = true;
                };
            };

            groups =
                optionalAttrs (cfg.group == "fanworks-labels-server") { fanworks-labels-server = { }; };
        };

        systemd.services.fanworks-feed-server = {
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

            # this is where we can write a bash script to do everything we need 
            script = ''

                exec ${cfg.package}/bin/fanworks-feed-server
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
