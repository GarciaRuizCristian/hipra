

//Generic service to obtain key/value pairs of data based on a domain name input and variable name input
function getDomainValues(credentials/*, user,lang*/){
	MFP.Logger.debug("Microstrategy Integration adapter call...");
	
	var result;
	result = genericRequest('ZGET_VAR_GLOBAL',
						  credentials,
						  {'I_DOMINIO' : 'CRM','I_VAR' : 'MICRO_REPORT_ID'}
						  ); //,'getDomainValues.xsl');
	MFP.Logger.debug(result);
	return result;
	
}

function getEmailTemplate(credentials,lang){
	MFP.Logger.debug("Mail Template adapter call...");
	
	if(typeof lang == 'undefined'){
		lang = 'ES';
	}
	var result;
	result = genericRequest('ZGET_VAR_GLOBAL',
						  credentials,
						  {'I_DOMINIO' : 'CRM','I_VAR' : 'EMAILTEMPLATE_'+lang}
						  ); //,'getEmailTemplate.xsl');
	MFP.Logger.debug(result);
	return result;
	
}




/**
 * HELPER METHODS *********************************************************************************************************
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
	} else if (typeof object === "string" || typeof object === "number") {
		output += object; // < / ? >
    }
	return output;
}

function toSOAP_XML(parameters) {
	return object_toSoap(parameters);
}

function arr(array) {
	return !!array  && (array instanceof Array) ? array : [];
}

function obj(object) {
	return object instanceof Object ? object : {};
}

function genericRequest(action, credentials, parameters,xslt) {
	parameters = parameters || {} ;
	
	var request = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">'
		+'<soapenv:Header/>'
		+'<soapenv:Body>'
		+'<urn:'+action+'>';
	
	request += toSOAP_XML(parameters);	
    request += '</urn:'+action+'></soapenv:Body></soapenv:Envelope>';
    
    MFP.Logger.debug(request);
    
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
	return MFP.Server.invokeHttp(input);
}
