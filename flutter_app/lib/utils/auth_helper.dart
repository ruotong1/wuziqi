import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';

class AuthHelper {
  static Map<String, String> getSignedHeaders(
      String accessKeyId, String secretAccessKey, String url, String method, String body) {
    final uri = Uri.parse(url);
    final host = uri.host;
    final path = uri.path;
    final query = uri.query;

    final date = HttpDate.format(DateTime.now().toUtc());
    final contentSha256 = sha256.convert(utf8.encode(body)).toString();

    final signedHeaders = 'host;x-content-sha256;x-date';

    final canonicalRequest = [
      method.toUpperCase(),
      path,
      query,
      'host:$host',
      'x-content-sha256:$contentSha256',
      'x-date:$date',
      '',
      signedHeaders,
      contentSha256,
    ].join('\n');

    final signingKeyBytes = _sign(utf8.encode(secretAccessKey), utf8.encode('VolcengineRequest'));
    final signatureBytes = _sign(signingKeyBytes, utf8.encode(canonicalRequest));
    final signature = signatureBytes.map((e) => e.toRadixString(16).padLeft(2, '0')).join('');

    return {
      'Authorization': 'HMAC-SHA256 Credential=$accessKeyId, SignedHeaders=$signedHeaders, Signature=$signature',
      'Content-Type': 'application/json',
      'x-content-sha256': contentSha256,
      'x-date': date,
    };
  }

  static List<int> _sign(List<int> key, List<int> data) {
    final hmac = Hmac(sha256, key);
    final digest = hmac.convert(data);
    return digest.bytes;
  }
}


