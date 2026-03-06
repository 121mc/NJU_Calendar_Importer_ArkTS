export enum SchoolType {
    UNDERGRAD = "undergrad",
    GRADUATE = "graduate"
}
export class SchoolTypeHelper {
    static label(o: SchoolType): string {
        return o === SchoolType.UNDERGRAD ? '南京大学本科生' : '南京大学研究生';
    }
    static shortLabel(n: SchoolType): string {
        return n === SchoolType.UNDERGRAD ? '本科生' : '研究生';
    }
    static supportsFinalExams(m: SchoolType): boolean {
        return m === SchoolType.UNDERGRAD;
    }
    static appShowUrl(l: SchoolType): string {
        return l === SchoolType.UNDERGRAD
            ? 'https://ehall.nju.edu.cn/appShow?appId=4770397878132218'
            : 'https://ehall.nju.edu.cn/appShow?appId=4979568947762216';
    }
    static appIndexUrl(k: SchoolType): string {
        return k === SchoolType.UNDERGRAD
            ? 'https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/*default/index.do'
            : 'https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/*default/index.do';
    }
}
