import http from "@ohos:net.http";
import type { BusinessError } from "@ohos:base";
export class HttpService {
    static browserUserAgent: string = 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
    static async get(d16: string, e16?: Record<string, string>): Promise<string> {
        return HttpService.request(d16, http.RequestMethod.GET, e16, '');
    }
    static async postForm(v15: string, w15: Record<string, string>, x15?: Record<string, string>): Promise<string> {
        let y15 = HttpService.formEncode(w15);
        let z15: Record<string, string> = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };
        if (x15 !== undefined) {
            let a16 = Object.keys(x15);
            for (let b16 = 0; b16 < a16.length; b16++) {
                let c16 = a16[b16];
                z15[c16] = x15[c16];
            }
        }
        return HttpService.request(v15, http.RequestMethod.POST, z15, y15);
    }
    static async request(h15: string, i15: http.RequestMethod, j15?: Record<string, string>, k15?: string): Promise<string> {
        let l15 = http.createHttp();
        let m15: Record<string, string> = {
            'User-Agent': HttpService.browserUserAgent,
            'Accept': 'application/json, text/plain, */*'
        };
        if (j15 !== undefined) {
            let s15 = Object.keys(j15);
            for (let t15 = 0; t15 < s15.length; t15++) {
                let u15 = s15[t15];
                m15[u15] = j15[u15];
            }
        }
        try {
            let p15 = await l15.request(h15, {
                method: i15,
                header: m15,
                extraData: k15 === undefined ? '' : k15,
                readTimeout: 25000,
                connectTimeout: 20000,
                expectDataType: http.HttpDataType.STRING,
            });
            let q15 = Number(p15.responseCode ?? 0);
            let r15 = String(p15.result ?? '');
            if (q15 >= 400 || q15 === 0) {
                throw new Error(`HTTP ${q15}: ${r15}`);
            }
            return r15;
        }
        catch (n15) {
            let o15 = n15 as BusinessError;
            if (o15 && o15.code !== undefined) {
                throw new Error(`HTTP request failed. Code: ${o15.code}, message: ${o15.message}`);
            }
            throw n15 as Error;
        }
        finally {
            l15.destroy();
        }
    }
    static formEncode(b15: Record<string, string>): string {
        let c15 = Object.keys(b15);
        let d15: string[] = [];
        for (let e15 = 0; e15 < c15.length; e15++) {
            let f15 = c15[e15];
            let g15 = b15[f15] ?? '';
            d15.push(`${encodeURIComponent(f15)}=${encodeURIComponent(g15)}`);
        }
        return d15.join('&');
    }
}
