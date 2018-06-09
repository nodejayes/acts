type ActsConfiguration = {
    server: {
        verbose?: boolean,
        logfile?: {
            file: string,
            maxsize: number,
            level: number
        },
        cluster?: {
            active: boolean,
            worker: number
        },
        address: string,
        port: number,
        webroot: string,
        compress?: boolean,
        cors?: {
            enabled: boolean,
            default: {
                origin: string,
                methods: string,
                headers: string,
                credentials: boolean
            }
        },
        api?: {
            routepath: string,
            routealias: string,
            allowedMethods: string[],
            reload: boolean
        },
        ssl?: {
            usessl: boolean,
            certificate: string,
            privatekey: string,
            certificationauthority: string[],
            redirectnonsslrequests: boolean
        },
        allowedExtensions?: string[],
        messageFormat?: string,
        websockets?: {
            usewebsockets: boolean,
            socketpath: string
        },
        access?: {
            maxsocketperip: number
        }
    },
    redirectrules?: any,
    plugins?: any
};

type ActsCluster = {
    start: (cb: () => void) => void;
    shutdownInstances: () => void;
    setAuthentication: (method: (req: any, res: any, next: () => void) => void) => void;
    setHook: (method: (req: any, res: any, next: () => void) => void) => void;
};

export function createServer(cwd: string, cfg: ActsConfiguration, plugins: any[]): ActsCluster;
export function authentication(authentication: (req: any, res: any, next: () => void) => void): void;
export function hook(hook: (req: any, res: any, next: () => void) => void): void;
export function shutdown(): void;
