var baseUrl = 'https://rest.ehrscape.com/rest/v1';

var username = "ois.seminar";
var password = "ois4fri";

var ID = [0, 0, 0];
var Array_A = ["John", "Bash", "Sara"];
var Array_B = ["Doe", "Queen", "Lance"];
var Array_C = ["1994-07-14T16:16", "1994-08-26T10:30", "1994-10-20T23:50"];
var Array_D = ["Male", "Male", "Female"];

var sessionId;

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function patients() {
	generator(0);
	generator(1);
	generator(2);
}

function generator (i) {
	sessionId = getSessionId();
	var Name    = Array_A [i];
	var Surname = Array_B [i];
	var Birth   = Array_C [i];
	var Gendre  = Array_D [i];
	var ehrId;
	
	$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
	$.ajax({
	    url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	        ehrId = data.ehrId;
	        ID [i] = ehrId;
			var partyData = {
		    	firstNames: Name,
		 	    lastNames: Surname,
		 	    dateOfBirth: Birth,
		 	    gender: Gendre,
		 	    partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
			};
		     $.ajax({
		    	url: baseUrl + "/demographics/party",
		        type: 'POST',
		        contentType: 'application/json',
		        data: JSON.stringify(partyData),
		        success: function (party) {
		 			if (party.action == 'CREATE') {
		                    var Patient_List = "<option class=\"Patient_List\" value=\""+ ID[i] +"\">" + Name + " " + Surname + "</option>";
							$("#list").append(Patient_List);
							addData(i);
		                }
		            },
		            error: function(err) {
		 			$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		 		}
		 	});
 		}
	});
}

function addData(i) {
	if (ID[i] !== 0){
		var BirthDate = Array_C [i];
		var Height;
		var Weight;

		if (Array_D[i] == "Female"){
			Height = Math.floor((Math.random() * 30) + 155);
			Weight = Math.floor((Math.random() * 40) + 50);
		}
		else {
			Height = Math.floor((Math.random() * 35) + 165);
			Weight = Math.floor((Math.random() * 45) + 60);
		}

		for(var j = 1; j <= 10; j++){
			BirthDate    = BirthDate.split("-");
			if (j == 1){
				BirthDate[0] = BirthDate[0] + 6;
			}
			BirthDate[0] = BirthDate[0] + i;
			BirthDate    = BirthDate.join("-");
			var DateAndTime = BirthDate;

			Height = Height + (Math.floor(Math.random() * 2 ));
			Height = Height - (Math.floor(Math.random() * 2 ));

			Weight = Weight + (Math.floor(Math.random() * 5 ));
			Weight = Weight - (Math.floor(Math.random() * 5 ));

			var Temp = Math.floor(Math.random() * 40);
			var telesnaTemperatura;
			if(Temp > 37)	telesnaTemperatura = (37 + (Math.random() * 4)); // Max: 41
			else			telesnaTemperatura = (37 - (Math.random() * 3)); // Min: 34

			Temp = Math.floor(Math.random() + 1);
			var SysPressure = Math.floor( 90 + (Math.random() * 50));
			var DysPressure = Math.floor( 60 + (Math.random() * 30));
			var Oxydation   = Math.floor(100 - (Math.random() * 10));
			var Commitee    = 'Uros Poland';
	
			$.ajaxSetup({
	 		    headers: {"Ehr-Session": sessionId}
	 		});
	 		var data = {
	 		    "ctx/language": "en",
	 		    "ctx/territory": "SI",
	 		    "ctx/time": DateAndTime,
	 		    "vital_signs/height_length/any_event/body_height_length": Height,
	 		    "vital_signs/body_weight/any_event/body_weight": Weight,
	 		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
	 		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
	 		    "vital_signs/blood_pressure/any_event/systolic": SysPressure,
	 		    "vital_signs/blood_pressure/any_event/diastolic": DysPressure,
	 		    "vital_signs/indirect_oximetry:0/spo2|numerator": Oxydation
	 		};
	 		var requestParameters = {
	 		    "ehrId": ID[i],
	 		    templateId: 'Vital Signs',
	 		    format: 'FLAT',
	 		    committer: Commitee
	 		};
	 		$.ajax({
	 		    url: baseUrl + "/composition?" + $.param(requestParameters),
	 		    type: 'POST',
	 		    contentType: 'application/json',
	 		    data: JSON.stringify(data),
	 		});
		}
	}
}

function displayInfo (ehrId){
	sessionId = getSessionId();	
	$.ajax({
	    url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (data) {
	        var party = data.party;
	        
	        var patient = "<img src=\"pics/patient.png\" id=\"patient\">";
			$("#patient").append(patient);
			
			var name = "<p class=\"style_04\">" + party.firstNames + ' ' + party.lastNames + "</p>";
			$("#data").append(name);
			
			var birth = party.dateOfBirth.split("T");
			var date = birth[0];
			var time = birth[1];
			time = time.substring(0, 5);
			birth = "<p class=\"style_02\"><b> Birth: </b><span class=\"style_02\">" + date + ", " + time + "</span></p>";
			$("#data").append(birth);
			
			var gender = "<p class=\"style_02\"><b> Gendre: </b> <span class=\"style_02\">" + party.gender + "</span> </p>";
			$("#data").append(gender);
			
			var nurse = "<img src=\"pics/nurse.png\" id=\"nurse\">";
			$("#patient").append(nurse);
		},
		error: function(err) {
			return;
		}
	});
}
