//This token will be valid for all environments (DEV, QUA and PROD)
//Token: U0lQX1NBUDpTQVBfU0lQ (stored in AppConfig.securityToken)


//TODO BORRAR:
function secret() {
	MFP.Logger.info("SAPCRM :: testLogin : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	return {"secret":"SuperSeguro testLogin"};
}
















/*
 * Mappings 
 */
var langMap = {
        'af' : 'a',  'de' : 'D',  'bg' : 'W', 'ca' : 'S',
        'cs' : 'C',  'zh' : '1',  'ko' : '3', 'hr' : '6',
        'da' : 'K',  'sk' : 'Q',  'sl' : '5', 'es' : 'S',
        'et' : '9',  'fi' : 'U',  'fr' : 'F', 'el' : 'G',
        'he' : 'B',  'nl' : 'N',  'hu' : 'H', 'id' : 'i',
        'en' : 'E',  'is' : 'b',  'it' : 'I', 'ja' : 'J',
        'lv' : 'Y',  'lt' : 'X',  'ms' : '7', 'no' : 'O',
        'pl' : 'L',  'pt' : 'P',  'ro' : '4', 'ru' : 'R',
        'sr' : '0',  'sv' : 'V',  'tr' : 'T', 'th' : '2',
        'uk' : '8',  'ar' : 'A'
};

/***************************************************************************************************************************
 * 														AUTHENTICATION
 ***************************************************************************************************************************/

/**
 * Verifies if the specific user and password are valid credentials
 * 
 * @param credentials {String} a base64 endoded string with the content <user>:<pass> for the SAP auth user
 * @param user {String} The loggedin user username
 * @param pass {String} The loggedin user password
 */
function login(credentials, user, pass) {

	MFP.Logger.info("SAPCRM :: login : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return genericRequest('ZIPAD_LOGIN', credentials, {
		'P_USUARIO': user,
		'P_PASSWORD': pass
	} ).Envelope.Body["ZIPAD_LOGIN.Response"].O_RESULTADO; 
}

/***************************************************************************************************************************
 * 														PARTNERS
 ***************************************************************************************************************************/

/**
 * Ej: "U0lQX1NBUDpTQVBfU0lQ","E","JRODRIGUES","20000313","0","1"," "
 * @param credentials {String} 
 * @param lang {String} 
 * @param user {String} 
 * @param modification {String} 
 * @param offset {String} 
 * @param limit {String} 
 * @param xWeb {String} Flag is to have the back-end filter the items that have been marked for deletion.
 * @returns {Object} The result of the update of the partner
 */
function getPartners(credentials, lang, user, modification, offset, limit, xWeb)   {
	
	MFP.Logger.info("SAPCRM :: getPartners : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPADWL_GETPARTNERS', credentials, {
        'FMODIFICACION': modification,
        'P_DESDE': offset,
        'P_HASTA': limit,
        'P_LANG' : lang,
        'P_USUARIO': user,
        'P_WEB' : xWeb,
        'P_CRMV3': 'X',
    }); //,'partnersGeneric.xsl'
}

/**
 * 
 * @param credentials
 * @param lang
 * @param user
 * @param modification
 * @param offset
 * @param limit
 * @param xWeb
 * @returns
 */
function getPartners_poc_nmm(credentials,lang, user, modification, offset, limit,xWeb)   {
	MFP.Logger.info("SAPCRM :: getPartners_poc_nmm : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	//The P_WEB flag is to have the back-end filter the items that have been marked for deletion.
   return genericRequest('ZIPADWL_GETPARTNERS',credentials,{
       'FMODIFICACION': modification,
       'P_DESDE': offset,
       'P_HASTA': limit,
       'P_LANG' : lang,
       'P_USUARIO': user,
       'P_WEB' : xWeb,
       'P_CRMV3': 'X',
       'P_ACT_LIST': 'X'
    }); //,'partnersGeneric.xsl'
}

/**
 * Creates a new partner
 * @param partner {String} The string representation of a partner
 * @returns {Object} The result of the update of the partner
 */
function pushCreatePartner(partner, credentials, user) {
	
	MFP.Logger.info("SAPCRM :: pushCreatePartner : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var partnerObj = JSON.parse(partner);
	
	var pPartner = cloneIfRootsMatch(/^[A-Z_]+$/, partnerObj);    
	pPartner.P_USUARIO = user;
	
	//This next parameter is a flag so that the back-end knows what version of the service
	//to call. In this case, the back-end reognizes the app as version 3 (which is the worklight version of sapcrm.
	//Version 2 (native app with worklight adapters takes an empty string as p_CRMv3 value
	//var pFlag = 'X';
	pPartner.P_CRMV3 = 'X';
		
    return genericRequest('ZIPADWL_CREATEPARTNER', credentials, pPartner); //, 'createPartner.xsl');
}


/**
 * Updates the received partner
 * @param partner {String} The string representation of a partner
 * @returns {Object} The result of the update of the partner
 */
function pushChangePartner(partner, credentials, user) {
	MFP.Logger.info("SAPCRM :: pushChangePartner : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var partnerObj = JSON.parse(partner);
	
	var pPartner = cloneIfRootsMatch(/^[A-Z_]+$/, partnerObj);
	pPartner.P_USUARIO = user;
	
	//This next parameter is a flag so that the back-end knows what version of the service
	//to call. In this case, the back-end reognizes the app as version 3 (which is the worklight version of sapcrm.
	//Version 2 (native app with worklight adapters takes an empty string as p_CRMv3 value
	//var pFlag = 'X';
	pPartner.P_CRMV3 = 'X';
	
   return genericRequest('ZIPADWL_CHANGEPARTNER', credentials, pPartner); //, 'updatePartner.xsl');
}


/***************************************************************************************************************************
 * 														ACTIVITIES
 ***************************************************************************************************************************/

/**
 * 
 * @param credentials
 * @param lang
 * @param user
 * @param modification
 * @param offset
 * @param limit
 * @returns
 */
function getActivities(credentials, lang, user, modification, offset, limit)   {
	MFP.Logger.info("SAPCRM :: getActivities : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
    return genericRequest('ZIPADWL_GETACTIVIDADES', credentials, {
       'FMODIFICACION': modification,
       'P_DESDE': offset,
       'P_HASTA': limit,
       'P_LANG' : lang,
       'P_USUARIO': user
    }); // 'genericActivitiy.xsl');    
}

/**
 * 
 * @param activity
 * @returns
 */
function pushCreateActivity(activity, credentials, user){
	MFP.Logger.info("SAPCRM :: pushCreateActivity : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var activityObj = JSON.parse(activity);
		//credentials = activityObj._credentials.key,
		//loggedUsername = activityObj._credentials.user;
	
	var pActivity = cloneIfRootsMatch(/^[A-Z_]+$/, activityObj);
	pActivity.P_USUARIO = user; 
  
    return genericRequest('ZIPADWL_CREATEACTIVIDAD', credentials, pActivity); // 'createActivity.xsl');
}

/**
 * 
 * @param activity
 * @returns
 */
function pushChangeActivity(activity, credentials, user){
	MFP.Logger.info("SAPCRM :: pushChangeActivity : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var activityObj = JSON.parse(activity);
		//credentials = activityObj._credentials.key;
	 	//loggedUsername = activityObj._credentials.user;
	
	var pActivity = cloneIfRootsMatch(/^[A-Z_]+$/, activityObj);
	pActivity.P_USUARIO = user;
	
    return genericRequest('ZIPADWL_CHANGEACTIVIDAD', credentials, pActivity); // 'genericActivitiy.xsl');
}


/**
 * 
 * @param activity
 * @returns
 */
function pushDeleteActivity(activity, credentials, user){
	MFP.Logger.info("SAPCRM :: pushDeleteActivity : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var activityObj = JSON.parse(activity);
		//credentials = activityObj._credentials.key;
	 	//loggedUsername = activityObj._credentials.user,
	 	object_id = activityObj.HEADER.OBJECT_ID;
	
	return genericRequest('ZIPAD_DELETEACTIVIDAD', credentials, {
        'P_USUARIO'   : user,
        'P_OBJECT_ID' : object_id,
    });
}

/***************************************************************************************************************************
 * 														PRODUCTS
 ***************************************************************************************************************************/

/**
 * Get the list of products from the Hipra server
 * @param credentials The application credential 
 * @param user The user login to get the associated products
 * @param lang The language to get the products
 * @returns The list of products in format:<br/>
 * "data": [{
		 <T>"ARTICULO": "HIPRAMOX",<br/>
		 "CLIENT": "300",<br/>
		 "IDMATERIAL": "000000000000080003",<br/>
		 "IDUNIDADNEGOCIO": "17922",<br/>
		 "MATERIAL": "HIPRAMOX ESP 100 ml#8",<br/>
		 "PAISDESTINO": "ES",<br/>
		 "UMBASE": "ST",<br/>
		 "UNIDADNEGOCIO": "26 AB rumiantes"<br/>
	},...]<br/>
    "errors": {},<br/>
	"info": {},<br/>
	"isSuccessful": true,<br/>
	"messages": [{<br/>
		"code": "000",<br/>
	    "message": "",<br/>
	    "type": ""<br/>
	}],<br/>
	"responseHeaders": {...},<br/>
	"responseTime": 381,<br/>
   	"statusCode": 200,<br/>
   	"statusReason": "OK",<br/>
   	"totalTime": 3050,<br/>
   	"warnings": {}
 */
function getProducts(credentials, lang, user, offset, limit){
	MFP.Logger.info("SAPCRM :: getProducts : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
   
    return genericRequest('ZIPADWL_GETPRODUCTS', credentials, {
        'O_PRODUCTS': { 'item':'' },
        'P_DESDE': offset,
        'P_HASTA': limit,
        'P_LANG': lang,
        'P_USUARIO': user 
    });// 'products.xsl');
}

/***************************************************************************************************************************
 * 														RELATIONS
 ***************************************************************************************************************************/
/* 
 * Methods : Relations
 *****************************/

function createRel(credentials,user,rels) {
	MFP.Logger.info("SAPCRM :: createRel : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var params = {
        'T_REL' : rels,
        'USUARIO' : user
    };
	
	return genericRequest('ZIPADWL_CREATE_REL', credentials, params );	 
}

function deleteRel(credentials, user, rels) {
	MFP.Logger.info("SAPCRM :: deleteRel : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var params = {
        'T_REL' : rels,
        'P_USUARIO' : user
    };
	
	return genericRequest('ZIPADWL_DELETE_REL', credentials, params);
}

/***************************************************************************************************************************
 * 														LOVs
 ***************************************************************************************************************************/

/**
 * Fetch a list from Cache or SAP depending on avaliability, if the
 * requested language can't be fetched fallback to english.
 * 
 * @param credentials the user credentials
 * @param user the user to use
 * @param lang the language the list is been requested in
 * @param list the name of the list
 * @param bapi the bapi call that returns this list
 * @param type the bapi complex type for this list
 * @returns a response including the data for with the list
 */
function getList(credentials, user, lang, list, bapi, type) {
	MFP.Logger.info("SAPCRM :: getList : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    retData = genericListRequest(bapi, type, credentials, lang);

    if (retData.data.length) {
        return retData;
    }
    else{
    	MFP.Logger.info("No other invocation returned successfully. Invoking procedure with the english language...");
    	return genericListRequest(bapi, type, credentials, 'E');
    }
    
}

/**
 * 
 * @param credentials
 * @param user
 * @param lang
 * @returns
 */
function getReTypes(credentials, user, lang) {
	MFP.Logger.info("SAPCRM :: getReTypes : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var params = {
        'GT_TBZ9A' : '',
        'LANGU'    : lang,
        'P_CRMV3'  : 'X'
    };
	
	return genericRequest('ZIPADWL_RELTYPES', credentials, params);
}

/**
 * 
 * @param credentials
 * @param user
 * @param lang
 * @returns
 */
function getRUser(credentials, user, lang) {
	MFP.Logger.info("SAPCRM :: getReTypes : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
    lang = lang || 'E';
    
    var params = {
	    'T_ZONAS':'',
	    'USER': user
	};
    
    return genericRequest('ZIPADWL_RUTAS_USUARIO', credentials, params);
}

/**
 * 
 * @param lastSync
 * @param language
 * @returns
 */
function checkLOVSync(lastSync, language) {
	MFP.Logger.info("SAPCRM :: checkLOVSync : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var invocationData = {
        adapter    : 'sapcrmCache',
        procedure  : 'checkSync',
        parameters : [ lastSync, language ]
    };
    
	var retData = MFP.Server.invokeProcedure(invocationData);
	if (!!retData && !!retData.resultSet && retData.resultSet.length > 0) {
        return { data : retData.resultSet };
    }
	else {
		return { data : [] };
	}
}

/**
 * 
 * @param credentials
 * @param user
 * @returns
 */
function getUserValues(credentials, user/*,lang*/){
	MFP.Logger.info("SAPCRM :: getUserValues : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	return genericRequest('ZLDAP_CHECK_LOGIN', credentials, {
		'I_ATTRIBUTE': 'CN',
		'I_USERNAME' : user,
		'SERVERID' : 'LDAP_NOTES'
	},	'getUserValues.xsl');
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
 * 
 * @param obj
 * @returns
 */
function convertToArray(obj) {
	return obj instanceof Array ? obj : [obj];
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

/**
 * Generic request returning a list
 * @param list the BAPI, SOAPAction to call
 * @param type the return type of the list
 * @param credentials the user credentials token as a base64 string encoding <user>:<password>
 * @param lang the language code ISO or SAP format
 * @returns
 */
function genericListRequest(list, type, credentials, lang) {

	//By default, language is english. If the the argument language is Spanish, override it
	var parameters = {
		'LANGU': langMap[lang] || lang
	};
	
	if(lang == 'S'){
		parameters = {
			'SPRAS': langMap[lang] || lang
		};
	}
	
    parameters[type] = '';
    
    var res = genericRequest(list, credentials, parameters); 
	
	WL.Logger.info("genericListRequest "+list+" | "+type);
	WL.Logger.info("res.Envelope.Body "+JSON.stringify(res.Envelope.Body));
   
	return {"data": res.Envelope.Body[list+".Response"][type].item};
}

/**
 * Clones an array with objects enforcing an object template
 * newArray = [ template <union>  array[i] ]
 * 
 * @note this enforces objects in an array to respect the expected parameters
 * removing any parameter not expected and adding defaults to the ones missing.
 *  
 * 
 * @param array an array containing the objects
 * @param template the object template to use with the default values
 * @returns {Array} an array of objects using the template object as base
 */
function cloneTpl(array, template) {
	MFP.Logger.info("---cloneTpl START");
    var arr_r = [];
    for (var i = 0; i < array.length ; i++) {
        var obj = {};
        for (key in template) {
            obj[key] = array[i][key] || template[key];
        }
        arr_r.push(obj);
    }
    return arr_r;
}

/**
 * Clones a given object but only containing the root properties that match a given regex
 * 
 * ex: cloneIfRootsMatch(/[A-Z]+/,partner)
 * ex: cloneIfRootsMatch(
 * 			/PARTNER|GUID|ADTEL|ADFAX|ADNOTES/
 * 		,partner)
 * 
 * @param regex the regex that validates if a key should be included or not
 * @param object the object to clone
 * @returns {object} the cloned object containing only the keys that match
 */
function cloneIfRootsMatch(regex, object) {
	//MFP.Logger.info("---cloneIfRootsMatch START");
	var clone = {};	
				
	for (var key in object) {
		if (regex.test(key)) clone[key] = object[key];
	}
	
	return clone;
}

/**
 * Clone a given object but selecting only a few properties, if they don't exist assume def or null
 * @param properties the properties to clone
 * @param object the object owning the properties to clone
 * @param def the default value to use if the object does't contain the property
 * @returns {object} an object with the cloned properties
 */
function cloneProperties(properties,object,def) {


	var clone = {};
	def = def || null;
	object = object || {};
	
	if (!(properties instanceof Array)) return clone;
	
	for (var i = 0 ; i < properties.length ; i++) {
		clone[properties[i]] = object[properties[i]] || def ;
	}
	return clone;
}


/**
 * Ej: ['U0lQX1NBUDpTQVBfU0lQ',0,15,'ES','P','JDF']
 * @param credentials {String} 
 * @param p_desde {String} 
 * @param p_hasta {String} 
 * @param p_lang {String} 
 * @param p_tipopartner {String} 
 * @param p_usuario {String} 
 * @returns {Object} The result of the update of the partner
 */
function getOptimizedPartnersList(credentials, p_desde, p_hasta, p_lang, p_tipopartner, p_usuario)   {
	
	MFP.Logger.info("SAPCRM :: getOptimizedPartnersList : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

    return  genericRequest('ZIPADWL_GETPARTNERS_LIST', credentials, {
        'P_DESDE': p_desde,
        'P_HASTA': p_hasta,
		'P_LANG' : p_lang,
		'P_TIPOPARTNER' : p_tipopartner,
        'P_USUARIO': p_usuario
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
