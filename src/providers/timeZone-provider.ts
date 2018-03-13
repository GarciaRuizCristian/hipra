import { Injectable } from '@angular/core';


@Injectable()
export class TimeZoneProvider {
    timeZoneAbbrevations = {};

    constructor() {
        this.inicializateTimeZoneAbbrevations();
    }

    private inicializateTimeZoneAbbrevations() {
        this.timeZoneAbbrevations = {
            "Alpha Time Zone":"A", 
            "Australian Central Daylight Time":"ACDT",
            "Australian Central Standard Time":"ACST",
            "Acre Time":"ACT",
            "Australian Central Time":"ACT",
            "Australian Central Western Standard Time":"ACWST",
            "Arabia Daylight Time":"ADT",
            "Atlantic Daylight Time":"ADT",
            "Australian Eastern Daylight Time":"AEDT",
            "Australian Eastern Standard Time":"AEST",
            "Australian Eastern Time":"AET",
            "Afghanistan Time":"AFT",
            "Alaska Daylight Time":"AKDT",
            "Alaska Standard Time":"AKST",
            "Alma-Ata Time":"ALMT",
            "Amazon Summer Time":"AMST",
            "Armenia Summer Time":"AMST",
            "Anadyr Summer Time":"ANAST",
            "Anadyr Time":"ANAT",
            "Aqtobe Time":"AQTT",
            "Argentina Time":"ART",
            "Arabia Standard Time":"AST",
            "Atlantic Standard Time":"AST",
            "Atlantic Time":"AT",
            "Australian Western Daylight Time":"AWDT",
            "Australian Western Standard Time":"AWST",
            "Azores Summer Time":"AZOST",
            "Azores Time":"AZOT",
            "Azerbaijan Summer Time":"AZST",
            "Azerbaijan Time":"AZT",
            "Anywhere on Earth":"AoE",
            "Bravo Time Zone":"B",
            "Brunei Darussalam Time":"BNT",
            "Bolivia Time":"BOT",
            "Brasília Summer Time":"BRST",
            "Brasília Time":"BRT",
            "Bangladesh Standard Time":"BST",
            "Bougainville Standard Time":"BST",
            "British Summer Time":"BST",
            "Bhutan Time":"BTT",
            "Charlie Time Zone":"C",
            "Casey Time":"CAST",
            "Central Africa Time":"CAT",
            "Cocos Islands Time":"CCT",
            "Central Daylight Time":"CDT",
            "Cuba Daylight Time":"CDT",
            "Central European Summer Time":"CEST",
            "Central European Standard Time":"CET",
            "Chatham Island Daylight Time":"CHADT",
            "Chatham Island Standard Time":"CHAST",
            "Choibalsan Summer Time":"CHOST",
            "Choibalsan Time":"CHOT",
            "Chuuk Time":"CHUT",
            "Cayman Islands Daylight Saving Time":"CIDST",
            "Cayman Islands Standard Time":"CIST",
            "Cook Island Time":"CKT",
            "Chile Summer Time":"CLST",
            "Chile Standard Time":"CLT",
            "Colombia Time":"COT",
            "Central Standard Time":"CST",
            "Central Time":"CT",
            "Cape Verde Time":"CVT",
            "Chamorro Standard Time":"ChST",
            "Delta Time Zone":"D",
            "Davis Time":"DAVT",
            "Dumont-d'Urville Time":"DDUT",
            "Echo Time Zone":"E",
            "Easter Island Summer Time":"EASST",
            "Easter Island Standard Time":"EAST",
            "Eastern Africa Time":"EAT",
            "Ecuador Time":"ECT",
            "Eastern Daylight Time":"EDT",
            "Eastern European Summer Time":"EEST",
            "Eastern European Time":"EET",
            "Eastern Greenland Summer Time":"EGST",
            "East Greenland Time":"EGT",
            "Eastern Standard Time":"EST",
            "Foxtrot Time Zone":"F",
            "Further-Eastern European Time":"FET",
            "Fiji Summer Time":"FJST",
            "Fiji Time":"FJT",
            "Falkland Islands Summer Time":"FKST",
            "Falkland Island Time":"FKT",
            "Fernando de Noronha Time":"FNT",
            "Golf Time Zone":"G",
            "Galapagos Time":"GALT",
            "Gambier Time":"GAMT",
            "Georgia Standard Time":"GET",
            "French Guiana Time":"GFT",
            "Gilbert Island Time":"GILT",
            "Greenwich Mean Time":"GMT",
            "Gulf Standard Time":"GST",
            "South Georgia Time":"GST",
            "Guyana Time":"GYT",
            "Hotel Time Zone":"H",
            "Hawaii-Aleutian Daylight Time":"HADT",
            "Hawaii-Aleutian Standard Time":"HAST",
            "Hong Kong Time":"HKT",
            "Hovd Summer Time":"HOVST",
            "India Time Zone":"I",
            "Indochina Time":"ICT",
            "Israel Daylight Time":"IDT",
            "Indian Chagos Time":"IOT",
            "Iran Daylight Time":"IRDT",
            "Irkutsk Summer Time":"IRKST",
            "Irkutsk Time":"IRKT",
            "Iran Standard Time":"IRST",
            "India Standard Time":"IST",
            "Irish Standard Time":"IST",
            "Israel Standard Time":"IST",
            "Japan Standard Time":"JST",
            "Kilo Time Zone":"K",
            "Kyrgyzstan Time":"KGT",
            "Kosrae Time":"KOST",
            "Krasnoyarsk Summer Time":"KRAST",
            "Krasnoyarsk Time":"KRAT",
            "Korea Standard Time":"KST",
            "Kuybyshev Time":"KUYT",
            "Lima Time Zone":"L",
            "Lord Howe Daylight Time":"LHDT",
            "Lord Howe Standard Time":"LHST",
            "Line Islands Time":"LINT",
            "Mike Time Zone":"M",
            "Magadan Summer Time":"MAGST",
            "Magadan Time":"MAGT",
            "Marquesas Time":"MART",
            "Mawson Time":"MAWT",
            "Mountain Daylight Time":"MDT",
            "Marshall Islands Time":"MHT",
            "Myanmar Time":"MMT",
            "Moscow Daylight Time":"MSD",
            "Moscow Standard Time":"MSK",
            "Mountain Standard Time":"MST",
            "Mountain Time":"MT",
            "Mauritius Time":"MUT",
            "Maldives Time":"MVT",
            "Malaysia Time":"MYT",
            "November Time Zone":"N",
            "New Caledonia Time":"NCT",
            "Newfoundland Daylight Time":"NDT",
            "Norfolk Time":"NFT",
            "Novosibirsk Summer Time":"NOVST",
            "Novosibirsk Time":"NOVT",
            "Nepal Time":"NPT",
            "Nauru Time":"NRT",
            "Newfoundland Standard Time":"NST",
            "Niue Time":"NUT",
            "New Zealand Daylight Time":"NZDT",
            "New Zealand Standard Time":"NZST",
            "Oscar Time Zone":"O",
            "Omsk Summer Time":"OMSST",
            "Omsk Standard Time":"OMST",
            "Oral Time":"ORAT",
            "Papa Time Zone":"P",
            "Pacific Daylight Time":"PDT",
            "Peru Time":"PET",
            "Kamchatka Summer Time":"PETST",
            "Kamchatka Time":"PETT",
            "Papua New Guinea Time":"PGT",
            "Phoenix Island Time":"PHOT",
            "Philippine Time":"PHT",
            "Pakistan Standard Time":"PKT",
            "Pierre & Miquelon Daylight Time":"PMDT",
            "Pierre & Miquelon Standard Time":"PMST",
            "Pohnpei Standard Time":"PONT",
            "Pacific Standard Time":"PST",
            "Pitcairn Standard Time":"PST",
            "Pacific Time":"PT",
            "Palau Time":"PWT",
            "Paraguay Summer Time":"PYST",
            "Paraguay Time":"PYT",
            "Pyongyang Time":"PYT",
            "Quebec Time Zone":"Q",
            "Qyzylorda Time":"QYZT",
            "Romeo Time Zone":"R",
            "Reunion Time":"RET",
            "Rothera Time":"ROTT",
            "Sierra Time Zone":"S",
            "Sakhalin Time":"SAKT",
            "Samara Time":"SAMT",
            "South Africa Standard Time":"SAST",
            "Solomon Islands Time":"SBT",
            "Seychelles Time":"SCT",
            "Singapore Time":"SGT",
            "Srednekolymsk Time":"SRET",
            "Suriname Time":"SRT",
            "Samoa Standard Time":"SST",
            "Syowa Time":"SYOT",
            "Tango Time Zone":"T",
            "Tahiti Time":"TAHT",
            "French Southern and Antarctic Time":"TFT",
            "Tajikistan Time":"TJT",
            "Tokelau Time":"TKT",
            "East Timor Time":"TLT",
            "Turkmenistan Time":"TMT",
            "Tonga Summer Time":"TOST",
            "Tonga Time":"TOT",
            "Turkey Time":"TRT",
            "Tuvalu Time":"TVT",
            "Uniform Time Zone":"U",
            "Ulaanbaatar Summer Time":"ULAST",
            "Ulaanbaatar Time":"ULAT",
            "The World's Time Standard":"UTC",
            "Uruguay Summer Time":"UYST",
            "Uruguay Time":"UYT",
            "Uzbekistan Time":"UZT",
            "Victor Time Zone":"V",
            "Venezuelan Standard Time":"VET",
            "Vladivostok Summer Time":"VLAST",
            "Vladivostok Time":"VLAT",
            "Vostok Time":"VOST",
            "Vanuatu Time":"VUT",
            "Whiskey Time Zone":"W",
            "Wake Time":"WAKT",
            "Western Argentine Summer Time":"WARST",
            "West Africa Summer Time":"WAST",
            "West Africa Time":"WAT",
            "Western European Summer Time":"WEST",
            "Western European Time":"WET",
            "Wallis and Futuna Time":"WFT",
            "Western Greenland Summer Time":"WGST",
            "West Greenland Time":"WGT",
            "Western Indonesian Time":"WIB",
            "Eastern Indonesian Time":"WIT",
            "Central Indonesian Time":"WITA",
            "West Samoa Time":"WST",
            "Western Sahara Summer Time":"WST",
            "Western Sahara Standard Time":"WT",
            "X-ray Time Zone":"X",
            "Yankee Time Zone":"Y",
            "Yakutsk Summer Time":"YAKST",
            "Yakutsk Time":"YAKT",
            "Yap Time":"YAPT",
            "Yekaterinburg Summer Time":"YEKST",
            "Yekaterinburg Time":"YEKT",
            "Zulu Time Zone":"Z"
        }
    }

    //Funcion que establece las horas que hay que sumar/restar a la recibida 
    //para ajustar la hora segun la zona horaria que indique la orden
    numHoursToSetTimeZone(order:any, cambiarSigno:boolean) {
        let horas;

        switch(order.TIMEZONE_FROM) {
        case "LINT": case "TOST": case "WST":
            horas = 14;
            break;
        case "CHADT": case "NZDT": case "PHOT": case "TKT": case "FJST": case "WST": case "TOT":
            horas = 13;
            break;
        case "MHT": case "ANAST": case "ANAT": case "NZST": case "PETT": case "CHAST": case "TVT": case "FJT": 
        case "GILT": case "WFT": case "M": case "MAGST":  case "NRT":  case "NZST":  case "PETST":  case "WAKT":
            horas = 12;
            break;
        case "AEDT": case "AET": case "NCT": case "NFT": case "PONT": case "SBT": case "SRET": case "VUT":
        case "BST": case "KOST": case "L": case "LHDT": case "MAGT": case "SAKT": case "VLAST":
            horas = 11;
            break;
        case "ACDT": case "ACT": case "AET": case "AEST": case "LHST": case "MAGT": case "PGT": case "ChST": 
        case "VLAT": case "YAPT": case "CHUT": case "DDUT": case "K": case "YAKST":
            horas = 10;
            break;
        case "ACST": case "ACT": case "AWDT": case "JST": case "KST": case "PWT": case "TLT": case "WIT": case "YAKT":
        case "CHOST": case "I": case "IRKST": case "KST": case "ULAST":
            horas = 9;
            break;
        case "LAWSTINT": case "MYT": case "BNT": case "PHT": case "CST": case "SGT": case "ULAT": case "HKT":
        case "WITA": case "IRKT": case "ACWST": case "AWST": case "CAST": case "CHOT": case "H": case "HOVST":
        case "KRAST": case "PYT":
            horas = 8;
            break;
        case "KRAT": case "WIB": case "HOVT": case "ICT": case "CXT": case "DAVT": case "G": case "NOVST":
        case "OMSST":
            horas = 7;
            break;
        case "KGT": case "ALMT": case "MMT": case "OMST": case "BST": case "BTT": case "CCT": case "YEKST": case "IOT":
        case "F": case "K": case "NOVT": case "QYZT": case "VOST":
            horas = 6;
            break;
        case "MVT": case "AZST": case "NPT": case "PKT": case "TJT": case "TMT": case "UZT": case "IST": case "YEKT":
        case "AMST": case "AQTT": case "E": case "MAWT": case "ORAT": case "TFT":
            horas = 5;
            break;
        case "AFT": case "AMT": case "MUT": case "AZT": case "RET": case "SAMT": case "SCT": case "GET": case "GST":
        case "IRDT": case "D": case "KUYT": case "MSD":
            horas = 4;
            break;
        case "MSK": case "MSK-1": case "EAT": case "EEST": case "IDT": case "IRST": case "ADT": case "C": case "FET":
        case "SYOT": case "TRT":
            horas = 3;
            break;
        case "CAT": case "CEST": case "SAST": case "EET": case "WAST": case "IST": case "AST": case "B":
            horas = 2;
            break;
        case "BST": case "CET": case "WAT": case "WEST": case "WST": case "IST": case "A":
            horas = 1;
            break;
        case "UTC": case "GMT": case "AZOST": case "EGST": case "WET": case "WT": case "Z":
            horas = 0;
            break;
        case "AZOT": case "CVT": case "EGT": case "N":
            horas = -1;
            break;
        case "NDT": case "BRST": case "PMDT": case "UYST": case "FNT": case "WGST": case "GST": case "O":
            horas = -2;
            break;
        case "ADT": case "AMST": case "ART": case "AT": case "NST": case "BRT": case "PMST": case "CLST": case "PYST":
        case "SRT": case "FKST": case "UYT": case "GFT": case "WGT": case "P": case "ROTT": case "WARST":
            horas = -3;
            break;
        case "AMT": case "AST": case "AT": case "BOT": case "CDT": case "CLT": case "PYT": case "EDT": case "FKT": 
        case "VET": case "GYT": case "CIDST": case "ET": case "Q":
            horas = -4;
            break;
        case "PET": case "CDT": case "COT": case "CST": case "EASST": case "ECT": case "EST": case "ACT": case "CIST":
        case "CT": case "ET": case "R":
            horas = -5;
            break;
        case "MDT": case "CST": case "EAST": case "GALT": case "CT": case "MT": case "S":
            horas = -6;
            break;
        case "PDT": case "MST": case "MT": case "PT": case "T":
            horas = -7;
            break;
        case "AKDT": case "PST": case "PT": case "U":
            horas = -8;
            break;
        case "AKST": case "MART": case "GAMT": case "HADT": case "V":
            horas = -9;
            break;
        case "HAST": case "CKT": case "TAHT": case "W":
            horas = -10;
            break;
        case "NUT": case "SST": case "X":
            horas = -11;
            break;
        case "AoE": case "Y":
            horas = -12;
            break;
        default:
            horas = 0;
            order.TIMEZONE_FROM = "UTC";
            break;
        }
        if (cambiarSigno) (horas <= 0) ? horas = Math.abs(horas) : horas = -Math.abs(horas);

        return horas;
    }

    //Funcion que devuelve la abreviacion de la zona horaria deseada
    public timeZoneAbbreviations(timeZone: string) {
        let tZAbbrevation: string = this.timeZoneAbbrevations[timeZone];

        if (tZAbbrevation)
            return tZAbbrevation;
        else
            return "UTC";
    }

    //Funcion que retorna la zona horaria de donde se encuentra el usuario (dispositivo)
    getDeviceTimeZone() {
        let date = new Date();
        let timeZone = date.toLocaleString('en-US', { timeZoneName: 'long' });
        (timeZone.search("AM") != -1) ? timeZone = timeZone.split("AM ")[1] : timeZone = timeZone.split("PM ")[1];

        return timeZone;
    }

    getOrderDateIndex(order: any): number {
        let indice = -1;

        order.DATE.forEach((dateOrder, index) => {
            if (dateOrder.APPT_TYPE == 'ORDERACTUAL') 
            indice = index;
        });

        return indice;
    }

    //Funcion que ajusta la hora que se va a mostrar segun la zona horaria donde se encuentre el usuario (dispositivo)
    adjustTimeZone(order: any, cambiarSigno: boolean) {
        //Sacamos el indice de la fecha de la orden actual
        let indice = this.getOrderDateIndex(order);

        if (indice >= 0) {
            console.log("SIN AJUSTAR --> FECHA FROM: " + order.DATE[indice].DATE_FROM + " | TIEMPO FROM: " + order.DATE[indice].TIME_FROM + " | ZONA HORARIA FROM: " + order.DATE[indice].TIMEZONE_FROM +
                        " FECHA TO: " + order.DATE[indice].DATE_TO + " | TIEMPO TO: " + order.DATE[indice].TIME_TO + " | ZONA HORARIA TO: " + order.DATE[indice].TIMEZONE_TO);

            let dateFecha: Array<String> = String(order.DATE[indice].DATE_FROM).split("-"); //Pasamos la fecha a un array [anio, mes, dia]
            let dateHora: Array<String> = String(order.DATE[indice].TIME_FROM).split(":"); //Pasamos el tiempo a un array [hora, minuto, segundo]

            //Creamos una fecha y establecemos la fecha y tiempo de la orden
            let fecha = new Date();
            fecha.setFullYear(Number(dateFecha[0])); //Anio
            fecha.setMonth(Number(dateFecha[1]) - 1); //Mes (0 - 11)
            fecha.setDate(Number(dateFecha[2])); //Dia (1 - 31)
            fecha.setHours(Number(dateHora[0])); //Hora (1 - 24)
            fecha.setMinutes(Number(dateHora[1])); //Minuto (1 - 60)

            //Obtenemos la zona horaria abreviada de donde se encuentra el usuario (dispositivo)
            order.DATE[indice].TIMEZONE_FROM = this.timeZoneAbbreviations(this.getDeviceTimeZone());

            //Creamos la fecha ajustada a la zona horaria establecida en la orden
            let fechaAjustada = new Date(new Date(fecha).getTime() + this.numHoursToSetTimeZone(order.DATE[indice], cambiarSigno) * 60 * 60 * 1000);

            //Guardamos la fecha ajustada
            order.DATE[indice].DATE_FROM = fechaAjustada.getFullYear() + "-"
                + ("0" + (fechaAjustada.getMonth() + 1)).slice(-2) + "-"
                + ("0" + (fechaAjustada.getDate())).slice(-2);
            order.DATE[indice].TIME_FROM = ("0" + (fechaAjustada.getHours())).slice(-2)
                + ":" + ("0" + (fechaAjustada.getMinutes())).slice(-2) + ":00";

            console.log("AJUSTADA --> FECHA FROM: " + order.DATE[indice].DATE_FROM + " | TIEMPO FROM: " + order.DATE[indice].TIME_FROM + " | ZONA HORARIA FROM: " + order.DATE[indice].TIMEZONE_FROM +
                        " FECHA TO: " + order.DATE[indice].DATE_TO + " | TIEMPO TO: " + order.DATE[indice].TIME_TO + " | ZONA HORARIA TO: " + order.DATE[indice].TIMEZONE_TO);
        }
    }

    defaultDate(order: any) {
        let date = new Date();

        //Sacamos el indice de la fecha de la orden actual
        let indice = this.getOrderDateIndex(order);

        if (indice >= 0) {
            //Obtenemos la fecha y hora de donde se encuentra el usuario (dispositivo)
            order.DATE[indice].DATE_FROM = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
            order.DATE[indice].TIME_FROM = ("0" + date.getHours()).slice(-2) + ":00:00";

            //Obtenemos la zona horaria abreviada de donde se encuentra el usuario (dispositivo)
            order.DATE[indice].TIMEZONE_FROM = this.timeZoneAbbreviations(this.getDeviceTimeZone());

            console.log("NUEVA ORDEN --> FECHA FROM: " + order.DATE[indice].DATE_FROM + " | TIEMPO FROM: " + order.DATE[indice].TIME_FROM + " | ZONA HORARIA FROM: " + order.DATE[indice].TIMEZONE_FROM +
            " FECHA TO: " + order.DATE[indice].DATE_TO + " | TIEMPO TO: " + order.DATE[indice].TIME_TO + " | ZONA HORARIA TO: " + order.DATE[indice].TIMEZONE_TO);
            console.log("FECHA POR DEFECTO: " + JSON.stringify(order.DATE[indice], null, 2));
        }
    }
}