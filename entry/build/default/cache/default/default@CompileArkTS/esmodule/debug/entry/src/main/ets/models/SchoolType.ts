export enum SchoolType {
    UNDERGRAD = "undergrad",
    GRADUATE = "graduate"
}
export class SchoolTypeHelper {
    static label(type: SchoolType): string {
        return type === SchoolType.UNDERGRAD ? '南京大学本科生' : '南京大学研究生';
    }
    static shortLabel(type: SchoolType): string {
        return type === SchoolType.UNDERGRAD ? '本科生' : '研究生';
    }
    static supportsFinalExams(type: SchoolType): boolean {
        return type === SchoolType.UNDERGRAD;
    }
    static appShowUrl(type: SchoolType): string {
        return type === SchoolType.UNDERGRAD
            ? 'https://ehall.nju.edu.cn/appShow?appId=4770397878132218'
            : 'https://ehall.nju.edu.cn/appShow?appId=4979568947762216';
    }
    static appIndexUrl(type: SchoolType): string {
        return type === SchoolType.UNDERGRAD
            ? 'https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/*default/index.do'
            : 'https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/*default/index.do';
    }
}
