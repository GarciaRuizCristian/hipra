package com.hipra.crm.login;


import com.ibm.json.java.JSONObject;
import com.ibm.mfp.adapter.api.AdaptersAPI;
import com.ibm.mfp.security.checks.base.UserAuthenticationSecurityCheck;
import com.ibm.mfp.server.registration.external.model.AuthenticatedUser;
import com.worklight.adapters.rest.api.WLServerAPI;
import com.worklight.adapters.rest.api.WLServerAPIProvider;

import java.awt.List;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.ws.rs.core.Context;

import org.apache.http.client.methods.HttpUriRequest;

public class SapLoginSecurityCheck extends UserAuthenticationSecurityCheck {

    private static Logger logger = Logger.getLogger(SapLoginSecurityCheck.class.getName());
    private static String MFP_PATH = "http://localhost:9080/mfp/api/adapters/";
    private static String ADAPTER_NAME = "sapcrm";
    private static String ADAPTER_METHOD = "login";
    private static String SECURITY_TOKEN = "U0lQX1NBUDpTQVBfU0lQ";

    //@Context
    //AdaptersAPI adaptersApi;

    private String userId, displayName;
    private String errorMsg;
    private boolean rememberMe = false;

    @Override
    protected AuthenticatedUser createUser() {
        return new AuthenticatedUser(userId, displayName, this.getName());
    }
    
    @Override
    protected boolean validateCredentials(Map<String, Object> credentials) {
        logger.warning("validateCredentials start");
        errorMsg = "";
        if(credentials!=null && credentials.containsKey("username") && credentials.containsKey("password")){
            String username = credentials.get("username").toString();
            String password = credentials.get("password").toString();
            String rememberMeStr = credentials.get("rememberMe").toString();

            try {
                String paramArray = "['"+SECURITY_TOKEN+"','"+username+"','"+password+"']";
				String url = MFP_PATH+ADAPTER_NAME+"/"+ADAPTER_METHOD+"?params="+URLEncoder.encode(paramArray);
				logger.warning("saplogin call to "+url);
				HashMap<String, String> httpRes = http(url,null, "UTF-8", true, null, null, true);
                
               
                /*HttpUriRequest req = adaptersApi.createJavascriptAdapterRequest(ADAPTER_NAME, ADAPTER_METHOD, new Object [] {SECURITY_TOKEN, username, password});
                org.apache.http.HttpResponse response = adaptersApi.executeAdapterRequest(req);
                JSONObject res = adaptersApi.getResponseAsJSON(response);*/

                logger.warning("Response: "+httpRes.toString());
                logger.warning("Response.content: "+httpRes.get("content"));
                JSONObject res = JSONObject.parse(httpRes.get("content"));
                if(!res.get("TYPE").equals("E")){
                    logger.warning("validateCredentials OK");
                    userId = username;
                    displayName = username;
                    rememberMe = Boolean.valueOf(rememberMeStr);
                    errorMsg = null;
                    return true;
                } else {
                    errorMsg = (String) res.get("MESSAGE");
                }
            } catch(Exception e) {
                e.printStackTrace();
                errorMsg = "Internal server error: "+e.getMessage();
            }

        } else {
            errorMsg = "The username and password were not provided.";
        }

        //In any other case, credentials are not valid
        logger.warning("validateCredentials KO: "+errorMsg);
        return false;
    }

    /**
	 * Hace una llamada HTTP.
	 * 
	 * @param strUrl La URL. puede llevar parámetros GET.
	 * @param querystringOrNull4Get Query String para los POST
	 * @param inCookieOrNull Cadena de cookies de entrada.
	 * @param encoding
	 * @param returnContent Si se pone un false, sólo se devuelven las cookies y el location
	 * @param refererOrNull
	 * @param userAgentOrNull
	 * @param followRedirects Si se pone false devuelve el staus que sea, aunque sea un "302 Object moved". Si es true
	 * 			sigue los "location" recibidos, acumulando las cookies de cada llamada (no como la librería estándar de Java,
	 * 			que las pierde.
	 * @return Devuelve un Mapa con los siguientes elementos:
	 * 			content: El contenido de la última página
	 * 			status: El código de status (200, 500, 302, etc.)
	 * 			cookie: Una cadena con TODAS las nuevas cookies recibidas del servidor
	 * 			location: La nueva URL del contenido solicitado
	 * 			referer: La URL del contenido devuelto
	 * 
	 * @throws IOException
	 */
	public static HashMap<String, String> http(String strUrl, String querystringOrNull4Get, String encoding, boolean returnContent, String refererOrNull, String userAgentOrNull, boolean followRedirects) throws IOException {
	    URL url = null;
	    String nextUrl = strUrl;
	    HttpURLConnection conexion = null;
		HashMap<String, String> ret = new HashMap<String, String>(4);
		String referer = refererOrNull;
		String querystring = querystringOrNull4Get;
		OutputStream out = null;
		String location = null;
		int rcode;
		String lastReferer = null;
		String contentType = null;
		
		do {
			location = null;
			url = new URL(nextUrl);
			lastReferer = nextUrl;
			conexion = (HttpURLConnection) url.openConnection();
			conexion.setInstanceFollowRedirects(false);
	
			// Para escribir en la conexion
			conexion.setDoOutput( querystring != null );
			// Para leer de la conexion
			conexion.setDoInput( true );
			// Para asegurar que la respuesta viene del servidor
			conexion.setUseCaches( false );
			
			if (referer != null) {
				conexion.setRequestProperty("Referer", referer);
			}
			
			if (userAgentOrNull != null) {
				conexion.setRequestProperty("User-Agent", userAgentOrNull);
			}
			
			if (querystring != null) {
				conexion.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
				
				conexion.setRequestProperty( "Content-Length", "" + querystring.length() );
		
				// Escribir los parametros en la conexion
				out = conexion.getOutputStream();		
				out.write( querystring.getBytes() );
				out.flush();
				out.close();
			}
			
			// Read the response
			rcode = conexion.getResponseCode();
			
			contentType = conexion.getContentType();
			
			location = conexion.getHeaderField("Location");
			
			if (location != null && location.startsWith("/")) {
				// Hay que añadir el servidor delante
				int pos = lastReferer.indexOf("//");
				if (pos > 0) {
					pos = lastReferer.indexOf('/',pos+3);
				}
				if (pos > 0) {
					location = lastReferer.substring(0, pos) + location;
				}
			} else if (location != null && !location.startsWith("http://") && !location.startsWith("https://")) {
					// Hay que añadir el directorio anterior delante
					int pos2 = lastReferer.indexOf("?");
					int pos = 0;
					pos = pos2 > 0? lastReferer.lastIndexOf("/", pos2): lastReferer.lastIndexOf("/");
					if (pos > 0) {
						location = lastReferer.substring(0, pos+1) + location;
					}
			}
			
			referer = nextUrl;
			nextUrl = location;
			querystring = null;

		} while (followRedirects && nextUrl != null && nextUrl.length() > 0);

		if (returnContent) {
			if (encoding == null || encoding.trim().length() < 1) {
				encoding = conexion.getContentEncoding();
				if (encoding == null) {
					encoding = conexion.getContentType();
					if (encoding != null && encoding.indexOf("charset=") >= 0) {
						encoding = encoding.substring(encoding.indexOf("charset=")+"charset=".length());
					} else {
						encoding = null;
					}
				}
				if (encoding == null) {
					encoding = "ISO-8859-1";
				}
			}
			
			byte[] cont = null;

			java.io.InputStream is = conexion.getInputStream();
			ByteArrayOutputStream os = new ByteArrayOutputStream();
			int b;
			while (true) {
				b = is.read();
				if ( b == -1 ) break;
				os.write(b);			
			}
			cont = os.toByteArray();
			
			os.close();
			is.close();

			conexion.disconnect();
			
			String strCont = new String(cont, encoding);
			
			ret.put("content", strCont);
		}

		
		if (location != null && location.trim().length() > 0) {
			ret.put("location", location.trim());
		}
		ret.put("status", "" + rcode);
		ret.put("referer", lastReferer);
		ret.put("contentType", contentType);
		
		return ret;
	}

    /**
     *
     * This method is describes the challenge JSON that gets sent to the client during the authorization process
     * This is called by the base class UserAuthenticationSecurityCheck when validateCredentials returns false and
     * the number of remaining attempts is > 0
     * @return the challenge object
     */
    @Override
    protected Map<String, Object> createChallenge() {
        Map<String, Object> challenge = new HashMap<String, Object>();
        challenge.put("errorMsg",errorMsg);
        challenge.put("remainingAttempts",getRemainingAttempts());
        return challenge;
    }

    @Override
    protected boolean rememberCreatedUser() {
        return rememberMe;
    }
}