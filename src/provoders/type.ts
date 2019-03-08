import { AlertOptions } from "ionic-angular";

interface VersionInfo {
    name: string;
    version: string;
    description: string[];
}

interface AlertParam {
    opts?: AlertOptions;
    showCancelButton?: boolean;
    confirmCallback?: Function;
    cancelCallback?: Function;
    autoDismiss?: boolean;
    message?: string;
}

export {
    VersionInfo, AlertParam
}