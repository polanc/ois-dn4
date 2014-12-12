var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var ID = [0, 0, 0];
var Array_A = ["First", "Second", "Third"];
var Array_B = ["Patient", "Patient", "Patient"];
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

function patients () {
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
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    var Patient_List = "<option class=\"Patient_List\" value=\""+ ID[i] +"\">" + Name + " " + Surname + "</option>"
							console.log(Patient_List);
							$("#list").append(Patient_List);
							dodajMeritveVitalnihZnakov(i);
		                }
		            },
		            error: function(err) {
		 			$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		 		    console.log(JSON.parse(err.responseText).userMessage);
		 		}
		 	});
 		}
	});
	dodajMeritveVitalnihZnakov(ehrId, i, sessionId);
}

function dodajMeritveVitalnihZnakov(i) {
	if (ID[i] !== 0){
		var BirthDate = Array_C [i];
		BirthDate = BirthDate.split("-");
		BirthDate = BirthDate.join("-");
	
		var Height = Math.floor((Math.random() * 50) + 150);
		var Weight = Math.floor((Math.random() * 50) + 50);
	
		for(var j = 1; j <= 5; j++){
			BirthDate    = BirthDate.split("-");
			BirthDate[0] = BirthDate[0] + i;
			BirthDate    = BirthDate.join("-");
			var DateAndTime = BirthDate;
	
			Height = Height + (Math.floor(Math.random() * 2 ));
			Height = Height - (Math.floor(Math.random() * 2 ));
	
			Weight = Weight + (Math.floor(Math.random() * 5 ));
			Weight = Weight - (Math.floor(Math.random() * 5 ));
	
			var plus = Math.floor(Math.random() * 40);
			var telesnaTemperatura;
			if(plus > 37)	telesnaTemperatura = (37 + (Math.random() * 4)); // Max: 41
			else			telesnaTemperatura = (37 - (Math.random() * 3)); // Min: 34
	
			plus = Math.floor(Math.random() + 1);
			var SysPressure = Math.floor( 90 + (Math.random() * 50));
			var DysPressure = Math.floor( 60 + (Math.random() * 30));
			var Oxydation   = Math.floor(100 - (Math.random() * 10));
			var Commitee    = 'Uros Poland';
	
			$.ajaxSetup({
	 		    headers: {"Ehr-Session": sessionId}
	 		});
	 		var podatki = {
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
	 		var parametriZahteve = {
	 		    "ehrId": ID[i],
	 		    templateId: 'Vital Signs',
	 		    format: 'FLAT',
	 		    committer: Commitee
	 		};
	 		$.ajax({
	 		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
	 		    type: 'POST',
	 		    contentType: 'application/json',
	 		    data: JSON.stringify(podatki),
	 		    success: function (res) {
			    	console.log(res.meta.href);
			        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
			    },
	 		    error: function(err) {
	 		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
	 				console.log(JSON.parse(err.responseText).userMessage);
	 		    }
	 		});
		}
	}
}
 
 $(document).ready(function() {
	$('#preberiObstojeciEHR').change(function() {
 		$("#preberiSporocilo").html("");
 		$("#preberiEHRid").val($(this).val());
 	});
 	$('#preberiPredlogoBolnika').change(function() {
 		$("#kreirajSporocilo").html("");
 		var podatki = $(this).val().split(",");
 		$("#kreirajIme").val(podatki[0]);
 		$("#kreirajPriimek").val(podatki[1]);
 		$("#kreirajDatumRojstva").val(podatki[2]);
 	});
 	$('#preberiObstojeciVitalniZnak').change(function() {
 		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
 		var podatki = $(this).val().split("|");
 		$("#dodajVitalnoEHR").val(podatki[0]);
 		$("#dodajVitalnoDatumInUra").val(podatki[1]);
 		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
 		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
 		$("#dodajVitalnoTelesnaTemperatura").val(podatki[4]);
 		$("#dodajVitalnoKrvniTlakSistolicni").val(podatki[5]);
 		$("#dodajVitalnoKrvniTlakDiastolicni").val(podatki[6]);
 		$("#dodajVitalnoNasicenostKrviSKisikom").val(podatki[7]);
 		$("#dodajVitalnoMerilec").val(podatki[8]);
 	});
 	$('#preberiEhrIdZaVitalneZnake').change(function() {
 		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
 		$("#rezultatMeritveVitalnihZnakov").html("");
 		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});
 });
