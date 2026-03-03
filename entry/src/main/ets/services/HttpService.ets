import { http } from '@kit.NetworkKit';
import { BusinessError } from '@kit.BasicServicesKit';

export class HttpService {
  static browserUserAgent: string = 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

  static async get(url: string, headers?: Record<string, string>): Promise<string> {
    return HttpService.request(url, http.RequestMethod.GET, headers, '');
  }

  static async postForm(url: string, data: Record<string, string>, headers?: Record<string, string>): Promise<string> {
    let body = HttpService.formEncode(data);
    let requestHeaders: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };
    if (headers !== undefined) {
      let keys = Object.keys(headers);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        requestHeaders[key] = headers[key];
      }
    }
    return HttpService.request(url, http.RequestMethod.POST, requestHeaders, body);
  }

  static async request(url: string, method: http.RequestMethod, headers?: Record<string, string>, body?: string): Promise<string> {
    let request = http.createHttp();
    let mergedHeaders: Record<string, string> = {
      'User-Agent': HttpService.browserUserAgent,
      'Accept': 'application/json, text/plain, */*'
    };
    if (headers !== undefined) {
      let keys = Object.keys(headers);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        mergedHeaders[key] = headers[key];
      }
    }

    try {
      let response = await request.request(url, {
        method: method,
        header: mergedHeaders,
        extraData: body === undefined ? '' : body,
        readTimeout: 25000,
        connectTimeout: 20000,
        expectDataType: http.HttpDataType.STRING,
      });

      let code = Number(response.responseCode ?? 0);
      let resultText = String(response.result ?? '');
      if (code >= 400 || code === 0) {
        throw new Error(`HTTP ${code}: ${resultText}`);
      }
      return resultText;
    } catch (error) {
      let businessError = error as BusinessError;
      if (businessError && businessError.code !== undefined) {
        throw new Error(`HTTP request failed. Code: ${businessError.code}, message: ${businessError.message}`);
      }
      throw error as Error;
    } finally {
      request.destroy();
    }
  }

  static formEncode(data: Record<string, string>): string {
    let keys = Object.keys(data);
    let result: string[] = [];
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = data[key] ?? '';
      result.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    return result.join('&');
  }
}
