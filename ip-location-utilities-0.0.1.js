/*!
 * IP Location JavaScript library v0.0.1 powered by IPInfoDB API
 * (c) Dabrowski-Software-Development (https://github.com/dabrowski-software-development/IPLocationUtilityFunctions)
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 * 
 * 
 * Tested with Firefox Developer Edition, Firefox, Google Chrome, Opera and IE 11
 * 
 * 
 * Geolocation data is stored as serialized JSON in a cookie
 * Bug reports : http://forum.ipinfodb.com/viewforum.php?f=7
 * 
 * 
 * The origins of this code (original version comes from http://ipinfodb.com/ip_location_api_json.php)
 */
(
 function (window) {
    var self = this;
	


	/* private variables */

	var _IP_STATE_INITIALIZED_ = false;
	
	var _domain = 'api.ipinfodb.com';
	var _api;
	var _key = "9bd14b961ea6f732f962e3f7214a671de7b6913f4c3f1ba0a880bc6b5764e7ec";
	var _timeZone;
	var _url;
	var _geo_data;
	var _callbackFunc_Internal;
	
	/* end of private variables */
  
	
	/* private methods */
  
	// initialize IP Location state
	function initialize_Internal(timeZone, cityPrecision, callback) {
		_api = (cityPrecision === true) ? "ip-city" : "ip-country";
		_timeZone = timeZone;
		
		_callbackFunc_Internal = callback;
		
		// set API url
		setUrl_Internal();
		
		// mark that IP Location state was properly initialized
		_IP_STATE_INITIALIZED_ = true;
	}
  
	function throwErrorIf_IP_Location_State_Not_Initialized() {
		if(_IP_STATE_INITIALIZED_ === false) {
			throw Error("_IP_STATE_INITIALIZED_ flag was not properly initialized (set to true)! Invoke initialize() method first with correct arguments.");
		}
	}
  
	function getUrl_Internal() {
		return _url;
	}
  
	function setUrl_Internal() {
		_url = "http://" + _domain + "/v3/" + _api + "/?key=" + _key + "&format=json" + "&callback=" + "this.setGeoCookie_Internal";
		
		// API callback function that sets the cookie with the serialized JSON answer
		this.setGeoCookie_Internal = function (answer) {
			if (answer['statusCode'] === 'OK') {
				var answer_to_string = JSON.stringify(answer);
	  
				setCookie_Internal('geolocation', answer_to_string, 365);
      
				_geo_data = answer;
      
				_callbackFunc_Internal();
			}
		}
	}
  
	// check if cookie already exist. If not, query IPInfoDB
	function checkCookie_Internal() {
		throwErrorIf_IP_Location_State_Not_Initialized();
		
		var geolocationCookie = getCookie_Internal('geolocation');
		if (!geolocationCookie) {
			invokeGeolocation_Internal();
		}
		else {
			_geo_data = JSON.parse(geolocationCookie);
			_callbackFunc_Internal();
		}
	}


	// get the cookie content
	function getCookie_Internal(c_name) {
		if (document.cookie.length > 0 ) {
			c_start = document.cookie.indexOf(c_name + "=");
		if (c_start != -1){
        c_start = c_start + c_name.length + 1;
        c_end = document.cookie.indexOf(";", c_start);
        if (c_end == -1) {
          c_end = document.cookie.length;
        }
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return '';
  }
  
  // set the cookie
  function setCookie_Internal(c_name, c_value, expire) {
    var expiration_date = new Date();
    expiration_date.setDate(expiration_date.getDate() + expire);
	
    document.cookie = c_name + "=" + escape(c_value) + ((expire == null) ? "" : ";expires=" + expiration_date.toGMTString());
  }  
  
  // make request to IPInfoDB
  function invokeGeolocation_Internal() {
    try {
		  script = document.createElement('script');
		  script.src = getUrl_Internal();
		  document.body.appendChild(script);
    }
	catch(err) {
		console.log("Error while making request to IPInfoDB: " + err);
	}
  }
 
  // return a geolocation unique user id
  function getUserUniqueId_Internal(uniquePart) {
	throwErrorIf_IP_Location_State_Not_Initialized();
	
		if(uniquePart == null) {
			try {
				var ipAddress = _geo_data["ipAddress"];
				var countryCode = _geo_data["countryCode"];
				var countryName = _geo_data["countryName"];
				var regionName = _geo_data["regionName"];
				var cityName = _geo_data["cityName"];
				var zipCode = _geo_data["zipCode"];
				var latitude = _geo_data["latitude"];
				var longitude = _geo_data["longitude"];
				var timeZone = _geo_data["timeZone"];
				
				var id = ipAddress.toString() +
						 countryCode.toString() +
						 countryName.toString() +
						 regionName.toString() +
						 cityName.toString() +
						 zipCode.toString() +
						 latitude.toString() +
						 longitude.toString() +
						 ((_timeZone === true) ? timeZone.toString() : "");
						 
				return id; 
				}
			catch(err) {
				console.log("Error while returning a geolocation unique user id: " + err);
			}
		}
		else {
			try {
				var id;

				var part = _geo_data[uniquePart];
				
				if(uniquePart === "timeZone") {
				 	id =	((_timeZone === true) ? part.toString() : "");
				}
				else {
					id = part.toString();
				}
						 
				return id; 
				}
			catch(err) {
				console.log("Error while returning a geolocation unique user id: " + err);
			}			
		}
  }  
  
  /* Public API */

  self.initialize = function(timeZone, cityPrecision, callback) {
	return initialize_Internal(timeZone, cityPrecision, callback);
  }
  
  self.checkCookie = function() {
	return checkCookie_Internal();
  }
  
  self.getUserUniqueId = function(uniquePart) {
    return getUserUniqueId_Internal(uniquePart);
  }

  /* ~ Public API */



  /* Expose module API to the outside world */
  window.ipLocationUtilities = window.ipLocationUtilities || self;
 }
)(window)