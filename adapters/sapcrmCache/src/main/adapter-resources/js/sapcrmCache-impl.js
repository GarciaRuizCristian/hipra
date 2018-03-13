
var getProductsStatement = "select temp.IDTIPOMATERIAL,"+
	"temp.IDMATERIAL, temp.MATERIAL, temp.ATTRIBUTE, temp.PRODUCT_STATUS_ID,  "+
	"temp.PRODUCTID, temp.NUMUNCAJA from ( "+
"SELECT @rownum:=@rownum+1 rownum, t.* "+
"FROM (SELECT @rownum:=0) r, (select cache_products.IDTIPOMATERIAL, "+
	"cache_products.IDMATERIAL,  "+
	"cache_products.MATERIAL , "+
	"cache_products.ATTRIBUTE, "+
	"cache_products_to_user.PRODUCT_STATUS_ID, "+
	"cache_products_to_user.PRODUCTID, cache_products.NUMUNCAJA "+
	"FROM cache_products INNER JOIN cache_products_to_user ON cache_products.ID = cache_products_to_user.PRODUCTID "+
	"where cache_products_to_user.USER = ? and "+
	"(cache_products.UPDATED >= ? or cache_products_to_user.UPDATED >= ?)) t ) as temp "+
"where rownum >= ? && rownum <= ?";


function getProducts(credentials, lang, user, offset, limit, date) {
	
	MFP.Logger.info("SAPCRMCache :: getProducts : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	if(!date || date == undefined || date == '' || date == 'X'){
		date = "2000-02-02";
	}
	
	if(!offset || offset == undefined){
		offset = 0;
	}
	
	if(!limit || limit == undefined){
		limit = 1;
	}
	
	offset =parseInt(offset,0);
	limit = parseInt(limit,0);
    
    var dataTotalNumber = getProductsCount(user,date); 
    
    if (!!dataTotalNumber && !!dataTotalNumber.resultSet && dataTotalNumber.resultSet.length && dataTotalNumber.resultSet.length > 0 ) {
    	var totalNumber = dataTotalNumber.resultSet[0].totalNumber;
    	MFP.Logger.info("SAPCRMCache :: getProducts : Products to get: " + totalNumber);
    	
    	if(totalNumber > 0 ){

	    	var retData = MFP.Server.invokeSQLStatement({
	    		preparedStatement : getProductsStatement,
	    		parameters :[user, date, date, offset , limit]
	    	});
		   
		    if (!!retData.resultSet && retData.resultSet.length && retData.resultSet.length > 0) {
		        return { 
		        	'data' : retData.resultSet,
		        	'totalNumber' :  totalNumber
		        };
		    }
    	}
    } 
    else {
    	 var invocationData = {
    	            adapter             : 'sapcrm',
    	            procedure           : "getProducts",
    	            parameters          : [credentials, lang, user, offset, limit]
    	        };

    	 return MFP.Server.invokeProcedure(invocationData);
    }
    
    return { 
    	'data' : [],
    	'totalNumber' :  0
    };
}


var getProductsCountStatement = "select count(*) as totalNumber "+ 
	"FROM cache_products INNER JOIN cache_products_to_user ON cache_products.ID = cache_products_to_user.PRODUCTID "+ 
	"where cache_products_to_user.USER = ? and "+
	"(cache_products.UPDATED >= ? or cache_products_to_user.UPDATED >= ?)";

function getProductsCount(userID, date) {
	MFP.Logger.info("SAPCRMCache :: getProductsCount : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	return MFP.Server.invokeSQLStatement({
		preparedStatement : getProductsCountStatement,
		parameters :[userID, date, date]
	});
}


/* LOV Getter Methods: getProductsDeterminedUser
************************************/
var getProductsDeterminedUserStatement = "SELECT cache_products.IDMATERIAL, cache_products.ATTRIBUTE, cache_products.MATERIAL, cache_products.IDTIPOMATERIAL " +
"FROM cache_products INNER JOIN cache_products_to_user " +
"ON cache_products.ID = cache_products_to_user.PRODUCTID " +
"WHERE cache_products_to_user.USER = ? AND cache_products_to_user.PRODUCT_STATUS_ID != ?";
function getProductsDeterminedUser(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getProductsDeterminedUser : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

	var numStatus = 3;
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getProductsDeterminedUserStatement,
		parameters :[user, numStatus]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getProductsDeterminedUser : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials, user, lang, 'getProductsDeterminedUser', 'ZIPADWL_GETPRODUCTS','ZCRM_PROD_PAIS_ESP');
    }
}

/* LOV Getter Methods: getProductsToUser
************************************/
// var getProductsToUserStatement = "SELECT * FROM cache_products_to_user";
// function getProductsToUser(credentials, user, lang) {
// 	MFP.Logger.info("SAPCRMCache :: getProductsToUser : ARGUMENTS :");
// 	MFP.Logger.info(JSON.stringify(arguments));
	
// 	var retData = MFP.Server.invokeSQLStatement({
// 		preparedStatement : getProductsToUserStatement
// 	});
	
// 	if (!!retData.resultSet && retData.resultSet.length) {
//     	MFP.Logger.info("SAPCRMCache :: getProductsToUser : CACHED: " + retData.resultSet.length);
//         return { data : retData.resultSet };
//     }else {
//     	return getSAPList(credentials, user, lang, 'getProductsToUser', 'ZIPADWL_GETPRODUCTSTOUSER','ZPROD_ESP_USER');
//     }
// }

/* LOV Getter Methods: getCategories
************************************/
var getCategoriesStatement = "SELECT * FROM cache_categories WHERE LANGU = ?";
function getCategories(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getCategories : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));

	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getCategoriesStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getCategories : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials, user, lang, 'getCategories', 'ZIPADWL_CATEGORIA','GT_CRMC_ACT_CAT_T');
    }
}

/* 
* LOV Getter Methods: getCountries
************************************/
var getCountriesStatement = "SELECT * FROM cache_countries WHERE SPRAS = ?";
function getCountries(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getCountries : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getCountriesStatement,
		parameters :[lang]
	});
	
	
	//MFP.Logger.info("SAPCRMV :: invokeSQL :: retData: "+JSON.stringify(retData));
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getCountries : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getCountries','ZIPADWL_PAISES','GT_T005T');
    }
}
/* 
* LOV Getter Methods: getDepartments
************************************/
var getDepartmentsStatement = "SELECT * FROM cache_departments WHERE SPRAS = ?";
function getDepartments(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getDepartments : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getDepartmentsStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getDepartments : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getDepartments','ZIPADWL_DEPARTAMENTOS','GT_TB911');
    }
}

/* 
* LOV Getter Methods: getPaymentTerms
************************************/
var getPaymentTermsStatement = "SELECT * FROM cache_payment_terms  WHERE LANGU = ?";
function getPaymentTerms(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getPaymentTerms : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getPaymentTermsStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getPaymentTerms : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	//?
    }
}

/* 
* LOV Getter Methods: getPriceListType
************************************/
var getPriceListTypeStatement = "SELECT * FROM cache_price_list_type  WHERE LANGU = ?";
function getPriceListType(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getPriceListType : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getPriceListTypeStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getPriceListType : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	//?
    }
}

/* 
* LOV Getter Methods: getPriceList
************************************/
var getPriceListStatement = "SELECT * FROM cache_price_list";
function getPriceList(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getPriceList : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getPriceListStatement
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getPriceList : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	//?
    }
}

/* 
* LOV Getter Methods: getFICClasses
************************************/
var getFICClassesStatement = "SELECT * FROM cache_classific WHERE SPRAS = ?";
function getFICClasses(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getFICClasses : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getFICClassesStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getFICClasses : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getFICClasses','ZIPADWL_CLASSIFIC','GT_CRMC_CLASSIF_T');
    }
}

/* 
* LOV Getter Methods: getFunctions
************************************/
var getFunctionsStatement = "SELECT * FROM cache_functions WHERE SPRAS = ?";
function getFunctions(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getFunctions : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getFunctionsStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getFunctions : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getFunctions','ZIPADWL_FUNCIONES','GT_TB913');
    }
}

/* 
* LOV Getter Methods: getGroups
************************************/
var getGroupsStatement = "SELECT * FROM cache_groups WHERE SPRAS = ?";
function getGroups(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getGroups : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getGroupsStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getGroups : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getGroups','ZIPADWL_GROUPS','GT_TB002');
    }
}

/* 
* LOV Getter Methods: getInterl
************************************/
var getInterlStatement = "SELECT * FROM cache_interl WHERE SPRAS = ?"
function getInterl(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getInterl : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getInterlStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getInterl : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials, user, lang,'getInterl','ZIPADWL_TIPO_INTERLOCUTOR','GT_CRMC_PARTNER_FT');
    }
}

/* 
* LOV Getter Methods: getLanguages
************************************/
var getLanguagesStatement = "SELECT * FROM cache_languages WHERE SPRAS = ?";
function getLanguages(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getLanguages : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getLanguagesStatement,
		parameters: [lang]
	});
	
	if (false && !!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getLanguages : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    } else {
		MFP.Logger.info("SAPCRMCache :: getLanguages : NOT CACHED");
    	return getSAPList(credentials,user,lang,'getLanguages','ZIPADWL_IDIOMA','GT_T002T');
    } 
}

/* 
* LOV Getters Methods: getMarketingAttributes
************************************/
var getMarketingAttributesStatement = "SELECT * FROM cache_marketing_attributes WHERE __lang = ?";
function getMarketingAttributes(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getMarketingAttributes : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
   lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getMarketingAttributesStatement,
		parameters :[lang]
	});
	//MKT_ATTRS only fetches the attributes of all sub-species. To fetch each species header info, use
	//MKT_HEADERS instead
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getMarketingAttributes : CACHED: " + retData.resultSet.length);
       return { data : retData.resultSet };
   }else {
   	return getSAPList(credentials,user,lang,'getMarketingAttributes','ZIPADWL_GETMKTATTR','MKT_ATTRS');
   }   
   
}

/* 
* LOV Getters Methods: getMarketingHeaders
************************************/
var getMarketingHeadersStatement = "SELECT * FROM cache_marketing_headers WHERE __lang = ?";
function getMarketingHeaders(credentials, user, lang) {
	MFP.Logger.info("SAPCRMCache :: getMarketingHeaders : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
   
   lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getMarketingHeadersStatement,
		parameters :[lang]
	});
	//MKT_ATTRS only fetches the attributes of all sub-species. To fetch each species header info, use
	//MKT_HEADERS instead
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getMarketingHeaders : CACHED: " + retData.resultSet.length);
      return { data : retData.resultSet };
  }else {
  	return getSAPList(credentials,user,lang,'getMarketingHeaders','ZIPADWL_GETMKTATTR','MKT_HEADERS');
  }
}

/* 
* LOV Getter Methods: getObjectives
************************************/
var getObjectivesStatement = "SELECT * FROM cache_objectives WHERE LANGU = ?";
function getObjectives(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getObjectives : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getObjectivesStatement,
		parameters :[lang]
	});
	//MKT_ATTRS only fetches the attributes of all sub-species. To fetch each species header info, use
	//MKT_HEADERS instead
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getObjectives : CACHED: " + retData.resultSet.length);
      return { data : retData.resultSet };
  }else {
  	return getSAPList(credentials,user,lang,'getObjectives','ZIPADWL_GETOBJETIVO','GT_CRMC_ACT_OBJ_T');
  } 
}

/* 
* LOV Getter Methods: getOperationClasses
************************************/
var getOperationClassesStatement = "SELECT * FROM cache_operations_class WHERE LANGU = ?";
function getOperationClasses(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getOperationClasses : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getOperationClassesStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getOperationClasses : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getOperationClasses','ZIPADWL_CLASE_OPERACION','GT_CRMC_PROC_TYPE_T');
    }   
}

/* 
* LOV Getter Methods: getReasons
************************************/
var getReasonsStatement = "SELECT * FROM cache_reasons WHERE __lang = ?";
function getReasons(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getReasons : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getReasonsStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
		MFP.Logger.info("SAPCRMCache :: getReasons : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getReasons','ZIPADWL_MOTIVO','GT_CODE');
    }
}

/* 
* LOV Getter Methods: getResult
************************************/
var getResultStatement = "SELECT * FROM cache_result WHERE __lang = ?";
function getResult(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getResult : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getResultStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getResult : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getResult','ZIPADWL_RESULTADO','GT_CODE');
    }
}


/* 
* LOV Getter Methods: getRegions
************************************/
var getRegionsStatement = "SELECT * FROM cache_regions WHERE SPRAS = ?";
function getRegions(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getRegions : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getRegionsStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getRegions : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getRegions','ZIPADWL_REGIONES','GT_T005U');
    } 
}

/* 
* LOV Getter Methods: getStatus
************************************/
var getStatusStatement = "SELECT * FROM cache_status  WHERE __lang = ?";
function getStatus(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getStatus : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getStatusStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getStatus : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getStatus','ZIPADWL_STATUS','GT_STATUS');
    }
}

/* 
* LOV Getter Methods: getTextActClasses
************************************/
var getTextActClassesStatement = "SELECT * FROM cache_textact_class WHERE TDSPRAS = ?";
function getTextActClasses(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getTextActClasses : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";

	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getTextActClassesStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getTextActClasses : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getTextActClasses','ZIPADWL_CLASE_TEXTO_ACT','GT_TTXIT');
    }     
}

/* 
* LOV Getter Methods: getTextClasses
************************************/
var getTextClassesStatement = "SELECT * FROM cache_text_class WHERE TDSPRAS = ?";
function getTextClasses(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getTextClasses : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getTextClassesStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getTextClasses : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getTextClasses','ZIPADWL_CLASE_TEXTO','GT_TTXIT');
    }  
}

var getReTypesStatement = "SELECT * FROM cache_re_types WHERE SPRAS = ?";
function getReTypes(credentials,user, lang) {
	MFP.Logger.info("SAPCRMCache :: getReTypes : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	
	lang = lang || "E";
	
	var retData = MFP.Server.invokeSQLStatement({
		preparedStatement : getReTypesStatement,
		parameters :[lang]
	});
	
	if (!!retData.resultSet && retData.resultSet.length) {
    	MFP.Logger.info("SAPCRMCache :: getReTypes : CACHED: " + retData.resultSet.length);
        return { data : retData.resultSet };
    }else {
    	return getSAPList(credentials,user,lang,'getReTypes','ZIPADWL_RELTYPES','GT_TBZ9A');
    } 
}


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
function getSAPList(credentials,user,lang,list,bapi,type) {
	MFP.Logger.info("SAPCRMCache :: getSAPList : ARGUMENTS :");
	MFP.Logger.info(JSON.stringify(arguments));
	

    // If we have a cache miss, request this language from SAP
    	
	var invocationData = {
            adapter             : 'sapcrm',
            procedure           : "getList",
            parameters          : [credentials,user,lang,list,bapi,type]
        };

	return MFP.Server.invokeProcedure(invocationData);
}


var checkSyncStatement = "select cache,hash,lang,updated "  + 
		"from stats " +
		"where lang = ? and updated > ?";

function checkSync(date,language) {
	MFP.Logger.info("--checkSync lang: "+ language+" lastSync: "+date);

	return MFP.Server.invokeSQLStatement({
		preparedStatement : checkSyncStatement,
		parameters :[language, date]
	});
}





/* **************************************** */
/* *************** SYNC DATE *************** */
/* **************************************** */
var updateSyncDate_Insert = 'insert into sync_date (user, lastDate) values(?, ?)';
var updateSyncDate_Update = 'update sync_date set lastDate = ? where user = ?';
function updateSyncDate(user) {	
	var currentDate = new Date();
	var date = ""+(currentDate.getFullYear())+( currentDate.getMonth()+1 < 10 ? "0"+currentDate.getMonth()+1 : currentDate.getMonth()+1) + (currentDate.getDate() < 10 ? "0"+currentDate.getDate() : currentDate.getDate());
	
	var ret = MFP.Server.invokeSQLStatement({
		preparedStatement : updateSyncDate_Update,
		parameters : [date.toString(), user]
	});
	
	if(ret.isSuccessful == true && ret.updateStatementResult.updateCount == 0) { 
		ret = MFP.Server.invokeSQLStatement({
			preparedStatement : updateSyncDate_Insert,
			parameters : [user, date.toString()]
		});
	}

	return { 'date': date };
}

var getSyncDateStatement = 'select lastDate from sync_date where user = ?';
function getSyncDate(user) {
	return MFP.Server.invokeSQLStatement({
		preparedStatement : getSyncDateStatement,
		parameters : [user]
	});
}


var timeTestStatement = 'insert into test_time(txt, dt) values(?, ?)';
function insertTimeTest(msg, date) {
	return MFP.Server.invokeSQLStatement({
		preparedStatement : timeTestStatement,
		parameters : [ msg, date ]
	});
}

var vTestStatement = 'insert into test_v(v) values(?)';
function insertVTest(msg) {
	return MFP.Server.invokeSQLStatement({
		preparedStatement : vTestStatement,
		parameters : [ msg ]
	});
}

