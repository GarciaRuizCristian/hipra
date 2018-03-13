

/**
 * Ej: ['U0lQX1NBUDpTQVBfU0lQ','JDF','MasterKey']
 * @param credentials {String} 
 * @param user {String} The loggedin user username
 * @param pass {String} The loggedin user password
 * @returns {Object} The result of the update of the partner
 */
function login(credentials, user, pass)   {
	
	MFP.Logger.info("SAPCRM :: login : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPAD_LOGIN', credentials, {
        'P_USUARIO': user,
		'P_PASSWORD': pass
    });
}

/**
 * Ej: ['U0lQX1NBUDpTQVBfU0lQ',0,15,'ES','P','JDF','ACE']
 * @param credentials {String} 
 * @param p_desde {String} 
 * @param p_hasta {String} 
 * @param p_lang {String} 
 * @param p_tipopartner {String} 
 * @param p_usuario {String} 
 * @param p_search {String}
 * @returns {Object} The result of the update of the partner
 */
function getOptimizedPartnersList(credentials, p_desde, p_hasta, p_lang, p_tipopartner, p_usuario, p_search)   {
	
	MFP.Logger.info("SAPCRM :: getOptimizedPartnersList : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPADWL_GETPARTNERS_LIST', credentials, {
        'P_DESDE': p_desde,
        'P_HASTA': p_hasta,
		'P_LANG' : p_lang,
		'P_TIPOPARTNER' : p_tipopartner,
		'P_USUARIO': p_usuario,
		'P_SEARCH': p_search
    });
}

/**
 * Ej: ['U0lQX1NBUDpTQVBfU0lQ','X','X','ES','0000200006','hN+FU1KWI0OiKIMrw7OPCQ==']
 * @param credentials {String} 
 * @param p_act_list {String} 
 * @param p_crmv3 {String} 
 * @param p_lang {String} 
 * @param p_partner {String} 
 * @param p_partnerguid {String} 
 * @returns {Object} The result of the update of the partner
 */
function getOptimizedPartner(credentials, p_act_list, p_crmv3, p_lang, p_partner, p_partnerguid)   {
	
	MFP.Logger.info("SAPCRM :: getOptimizedPartner : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPADWL_READPARTNER', credentials, {
        'P_ACT_LIST': p_act_list,
        'P_CRMV3': p_crmv3,
		'P_LANG' : p_lang,
		'P_PARTNER' : p_partner,
        'P_PARTNER_GUID': p_partnerguid
    });
}


/**
 * Ej: ['U0lQX1NBUDpTQVBfU0lQ',20170101,20180101,'ES','JACA','test']
 * @param credentials {String} 
 * @param f_desde {String} 
 * @param f_hasta {String} 
 * @param p_lang {String}  
 * @param p_usuario {String} 
 * @param p_search {String} 
 * @returns {Object} The result of the update of the partner
 */
function getOptimizedActivitiesList(credentials, f_desde, f_hasta, p_lang, p_usuario, p_search)   {
	
	MFP.Logger.info("SAPCRM :: getOptimizedActivitiesList : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPADWL_GETACTIVIDADES_LIST', credentials, {
        'F_DESDE': f_desde,
        'F_HASTA': f_hasta,
		'P_LANG' : p_lang,
		'P_USUARIO': p_usuario,
		"P_SEARCH": p_search
    });
}

/**
 * Ej: ['U0lQX1NBUDpTQVBfU0lQ','E81CA10C46A4A2F180510050569D6B96']
 * @param credentials {String} 
 * @param p_guid {String}
 * @returns {Object} The result of the update of the partner
 */
function getOptimizedActivity(credentials, p_guid)   {
	
	MFP.Logger.info("SAPCRM :: getOptimizedActivity : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPADWL_GETACTIVIDAD', credentials, {
		'P_ACTIVIDAD_GUID' : p_guid,
		'HEADER': {'item' : ''},
        'DATE': {'item' : ''},
		'MATERIAL_TAB' : {'item' : ''},
		'OUTCOME' : {'item' : ''},
		'PARTNERS': {'item' : ''},
		'REASON' : {'item' : ''},
		'STATUS_TAB': {'item' : ''},
		'TEXT': {'item' : ''}
    });
}

/**
 * Ej: ['U0lQX1NBUDpTQVBfU0lQ',0,15,'ES','037','OR','JACA']
 * @param credentials {String} 
 * @param p_desde {String} 
 * @param p_hasta {String} 
 * @param p_lang {String} 
 * @param p_search {String}
 * @param p_tipoorder {String} 
 * @param p_usuario {String} 
 * @returns {Object} The result of the update of the partner
 */
function getOptimizedOrdersList(credentials, p_desde, p_hasta, p_lang, p_search, p_tipoorder, p_usuario)   {
	
	MFP.Logger.info("SAPCRM :: getOptimizedOrdersList : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPADWL_GETORDERS_LIST', credentials, {
        'P_DESDE': p_desde,
        'P_HASTA': p_hasta,
		'P_LANG' : p_lang,
		'P_SEARCH': p_search,
		'P_TIPOORDER' : p_tipoorder,
		'P_USUARIO': p_usuario
    });
}


/**
 * HELPER METHODS *********************************************************************************************************
 */

/**
 * Logs the error messages if exists and the corresponding entity, partner or activity.
 * @param entity {Object} The partner or activity to print in case of error
 * @param response {Object} The SAP server response that indicates if an error exists
 */
function logResponse(entity, response){
	var isValid = true;
	if(Array.isArray(response["messages"])){
		response.messages.every(function(value){
			if(value.type === "E"){
				isValid = false;
				return false;
			}else{
				return true;
			}
		});
	}
	
	if(isValid){
		 MFP.Logger.info("SAPCRM :: isSuccessful: " + response.isSuccessful +" RESPONSE TIME: " + response['totalTime']);
	    //MFP.Logger.info(response);
	}else{
		MFP.Logger.error("SAPCRM :: ERROR MESSAGES :");
		MFP.Logger.error(response.messages);
		MFP.Logger.error("SAPCRM :: ENTITY THAT GENERATE THE ERROR :");
		MFP.Logger.error(entity);
	}
}

/**
 * 
 * @param object
 * @returns {___anonymous13871_13876}
 */
function removeEscapes(object) {
	//MFP.Logger.info("removeEscapes...");
	//MFP.Logger.info("removeEscapes of "+JSON.stringify(object ? object : {}));
	var output = null;
	if (object != null) {
		if (object instanceof Array || (!!object.length && typeof object !== "string" )) {
			output = [];
	        if (object.length > 0) {
	            for (var i = 0 ; i < object.length ; i++) {
	            	output[i] = removeEscapes(object[i]);
	            }
	        }
		} else if (object instanceof Object || typeof object === 'object') {       
			output = {};
	        for (var key in object) {
	        	output[key] = removeEscapes(object[key]);
	        }
	    } else if (typeof object === "string") {
	    	if (object) {
	    		var replacedOutput = object.replace(/%26/g, "&");
	    		replacedOutput = replacedOutput.replace(/%3C/g, "<");
	    		replacedOutput = replacedOutput.replace(/%3E/g, ">");
	    		replacedOutput = replacedOutput.replace(/%25/g, "%");
	    		replacedOutput = replacedOutput.replace(/%27/g, "'");
	    		output = replacedOutput;
	    	} else {
	    		output = object;
	    	}
	    } else {
	        output = object;
	    }
	}
	//MFP.Logger.info("removeEscapes output "+output);
	return output;
}

/**
 * 
 * @param object
 * @returns {String}
 */
function object_toSoap(object) {
    var output = '';
    
    if (object instanceof Array || (!!object.length && typeof object !== "string" )) {
        if (object.length == 0 || !!object[0]) {
            for (var i = 0 ; i < object.length ; i++) {
                output += "<item>" + object_toSoap(object[i]) + "</item>";
            }
        } else {
            output += '<'+key+'/>';
        }
    } else if  (object instanceof Object || typeof object === 'object') {       
        for (var key in object) {
            var keyStr = isNaN(key) ? key : 'item'; // array like 
            
            if (!!!object[key] || (typeof object[key] == "string" && (object[key] == "" || object[key] == "null" ))) {
                output += '<'+keyStr+'/>';
            } else {
                output += '<'+keyStr+'>' + object_toSoap(object[key])+'</'+keyStr+'>';
            }
        }
    /*} else if (typeof object === "number" || typeof object === "string") {
    	output += object;
    }*/
    } else if (typeof object === "number") {
        output += object; // < / ? >
    } else if (typeof object === "string") {
    	if (object) {
    		var replacedOutput = object.replace(/%/g, "%25");
    		replacedOutput = replacedOutput.replace(/&/g, "%26");
    		replacedOutput = replacedOutput.replace(/</g, "%3C");
    		replacedOutput = replacedOutput.replace(/>/g, "%3E");
    		replacedOutput = replacedOutput.replace(/'/g, "%27");
    		output += replacedOutput;
    	} else {
    		output += object;
    	}
    }
    //MFP.Logger.info(output);
    return output;
}

/**
 * 
 * @param parameters
 * @returns
 */
function toSOAP_XML(parameters) {
    var soap = object_toSoap(parameters);
    return soap;
}

/**
 * Generic request method, which makes the soap invocations
 * @param action the BAPI, SOAPAction to call
 * @param credentials the user credentials token as a base64 string encoding <user>:<password>
 * @param parameters aditional parameters for the request
 * @param xslt the transformation template to apply
 * @returns the result of the http invocation
 */
function genericRequest(action, credentials, parameters, xslt) {

    parameters = parameters || {} ;
    
    var request = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">'
        +'<soapenv:Header/>'
        +'<soapenv:Body>'
        +'<urn:'+action+'>';
    
    request += toSOAP_XML(parameters);  
    request += '</urn:'+action+'></soapenv:Body></soapenv:Envelope>';
	
    MFP.Logger.info("SAPCRM :: genericRequest : REQUEST : " + request);
	
    var input = {
            method : 'post',
            returnedContentType : 'xml',
            returnedContentEncoding : 'UTF-8',
            path : 'sap/bc/soap/rfc',
            headers:{
                'SOAPAction' : 'http://www.sap.com/' + action,
                'Authorization' : 'Basic '+credentials,
            },
            body: {
                contentType:'text/xml;charset=UTF-8',
                content:request
            }
            
    };
	//xslt = xslt || 'generic.xsl';
    MFP.Logger.info("xslt: "+xslt);
   	if (xslt) {
		input.transformation = {
			type : 'xslFile',
			xslFile : xslt
		}
	}
	var response = MFP.Server.invokeHttp(input);
	MFP.Logger.info("typeof response: "+(typeof response));
	MFP.Logger.info("response: "+(JSON.stringify(response)));
	//return response;
	
    var invocationResult = removeEscapes(response);

    logResponse(parameters, invocationResult);
    
    return invocationResult;
}
