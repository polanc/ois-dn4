var baseUrl = 'https://rest.ehrscape.com/rest/v1';

var username = "ois.seminar";
var password = "ois4fri";

var element;

var Patient_ID  = [0, 0, 0];
var Patient_BMI = [0, 0, 0];
var Patient_DR  = [0, 0, 0];

var Doctor_Name = ["Grant", "Kathleen", "Kevin", "Kenneth", "Janice"];
var Doctor_Surn = ["Anderson", "Jones", "Reynolds", "Ross", "Brown"];
var Doctor_Loca = ["Zaloska Cesta 2 Ljubljana", "Krziceva 10 Ljubljana", "Zaloska Cesta 2 Ljubljana", "Krziceva 10 Ljubljana", "Krziceva 10 Ljubljana"];

var Array_A = ["Nick", "Abraham", "Maseo"];
var Array_B = ["Burkhardt", "Setrakian", "Yamashiro"];
var Array_C = ["1982-06-18T16:10", "1936-08-26T10:30", "1975-01-21T23:50"];
var Array_D = ["MALE", "MALE", "MALE"];

var sessionId;

function getSessionId () {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function patients () {
	generator (0);
	generator (1);
	generator (2);
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
		Patient_ID [i] = ehrId;
			var partyData = {
				firstNames: Name,
				lastNames: Surname,
				dateOfBirth: Birth,
				gender: Gendre,
				partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
			};
			$.ajax ({
				url: baseUrl + "/demographics/party",
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(partyData),
				success: function (party) {
					if (party.action == 'CREATE') {
						var Info = "<option class=\"Info\" value=\"" + Patient_ID [i] + "\">" + Name + " " + Surname + "</option>";
						$("#Info").append(Info);
					}
				},
				error: function(err) {
					$("#Info").html("<span class='message label label-danger fade-in'>Error '" + JSON.parse(err.responseText).userMessage + "'!");
				}
			});
		}
	});
}

function addData(i) {
	if (Patient_ID[i] !== 0){
		var BirthDate = Array_C [i];
		BirthDate = BirthDate.split("-");
		var Year = BirthDate[0];
		var Period = 2014 - Year - 20;
		BirthDate = BirthDate.join("-");
		var Doc_Num = Math.floor(Math.random() * 5);
		Patient_DR [i] = Doc_Num;
		var Height;
		var Weight;
		
		for(var j = 1; j <= Period; j++){
			BirthDate     = BirthDate.split("-");
			BirthDate [0] = BirthDate[0] + j;
			BirthDate     = BirthDate.join("-");
			var DateAndTime = BirthDate;
			BirthDate     = BirthDate.split("-");
			BirthDate [0] = BirthDate[0] - j;
			BirthDate     = BirthDate.join("-");
			var Temp = (Math.random() * 40);
			var BodyTemp;
			
			var Commitee = ("Dr. " + Doctor_Name [Patient_DR[i]] + " " + Doctor_Surn[Patient_DR[i]]);

			if (i === 0) {
				Height = (Math.random() * 10) + 178.4;
				Weight = (Math.random() *  5) + 79.6;
				Height = Height + (Math.random() * 3 );
				Height = Height - (Math.random() * 3 );
				Weight = Weight + (Math.random() * 4 );
				Weight = Weight - (Math.random() * 4 );
			}
			else if (i == 1) {
				Height = (Math.random() * 10) + 168.8;
				Weight = (Math.random() *  5) + 72.1;
				Height = Height + (Math.random() * 1 );
				Height = Height - (Math.random() * 1 );
				Weight = Weight + (Math.random() * 2 );
				Weight = Weight - (Math.random() * 2 );
			}
			else if (i == 2) {
				Height = (Math.random() * 10) + 173.3;
				Weight = (Math.random() *  5) + 72.8;
				Height = Height + (Math.random() * 2 );
				Height = Height - (Math.random() * 2 );
				Weight = Weight + (Math.random() * 3 );
				Weight = Weight - (Math.random() * 2 );
			}
			
			if (j == Period) {
				Patient_BMI[i] = ((Weight * 10000) / (Height * Height));
			}
				
			if (Temp > 37) {
				BodyTemp = (36 + (Math.random() * 4)); // Max: 40-36
				
			}
			else {
				BodyTemp = (37 - (Math.random() * 2)); // Min: 35-37
			}
				
			Temp = Math.floor(Math.random() + 1);
			var SysPressure = Math.floor( 90 + (Math.random() * 30));
			var DysPressure = Math.floor( 60 + (Math.random() * 20));
			var Oxydation   = Math.floor(100 - (Math.random() * 8));
				
			$.ajaxSetup({
				headers: {"Ehr-Session": sessionId}
			});
			var data = {
				"ctx/language": "en",
				"ctx/territory": "SI",
				"ctx/time": DateAndTime,
				"vital_signs/height_length/any_event/body_height_length": Height,
				"vital_signs/body_weight/any_event/body_weight": Weight,
				"vital_signs/body_temperature/any_event/temperature|magnitude": BodyTemp,
				"vital_signs/body_temperature/any_event/temperature|unit": "°C",
				"vital_signs/blood_pressure/any_event/systolic": SysPressure,
				"vital_signs/blood_pressure/any_event/diastolic": DysPressure,
				"vital_signs/indirect_oximetry:0/spo2|numerator": Oxydation
			};
			var requestParameters = {
				"ehrId": Patient_ID[i],
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

function displayLocation () {
	var FID = document.getElementById("Info");
	var SID = FID.options[FID.selectedIndex].value;
	var IND = 0;
	for (var n = 0; n <= 2; n++) {
		if (SID == Patient_ID[n]) {
			IND = n;
		}
	}
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(46.086283, 14.511189),
		mapTypeId: google.maps.MapTypeId.ROADMAP };
		var map = new google.maps.Map($("#map-container").get(0),mapOptions);
		var geocoder = new google.maps.Geocoder();
		var address = Doctor_Loca[Patient_DR[IND]];
		geocoder.geocode({address:address},function(results) {
		new google.maps.Marker({position:results[0].geometry.location,map:map});
	});
}

function displayInfo () {
	var FID = document.getElementById("Info");
	var SID = FID.options[FID.selectedIndex].value;
	var IND = 0;
	sessionId = getSessionId();
		
	for (var n = 0; n <= 2; n++) {
		if (SID == Patient_ID[n]) {
			IND = n;
		}
	}
		
	console.log("SID : " + SID);
	$.ajax({
		url: baseUrl + "/demographics/ehr/" + SID + "/party",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (data) {
			var party = data.party;
			clean_info();
			
			var patient = "<img src=\"pics/patient.png\" id=\"patient\">";
			$("#patient-pic").append(patient);
				
			var name = "<p class=\"style_04\">" + party.firstNames + ' ' + party.lastNames + "</p>";
			$("#data").append(name);
				
			var birth = party.dateOfBirth.split("T");
			var date = birth[0];
			var time = birth[1];
			time =  time.substring(0, 5);
			birth = "<p class=\"style_02\"><b> Birth: </b><span class=\"style_02\">" + date + " at " + time + "</span></p>";
			$("#data").append(birth);
				
			var gender = "<p class=\"style_02\"><b> Gendre: </b> <span class=\"style_02\">" + party.gender + "</span> </p>";
			$("#data").append(gender);
				
			var nurse = "<img src=\"pics/nurse.png\" id=\"nurse\">";
			$("#nurse-pic").append(nurse);
			
			var doc = ("Dr. " + Doctor_Name [Patient_DR[IND]] + " " + Doctor_Surn[Patient_DR[IND]]);
			var doctor = "<span class=\"style_04\">" + doc + "</span> </p>";
			$("#doc-name").append(doctor);
			
			var loc = (Doctor_Loca[Patient_DR[IND]]);
			var location = "<span class=\"style_04\">" + loc + "</span> </p>";
			$("#doc-loca").append(location);
		},
		error: function(err) {
			return;
		}
	});
	$.ajax({
		url: baseUrl + "/view/" + SID + "/height",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var Height = "<p span class=\"style_08\">" + res[x].height + " " + res[x].unit + "</span> </p>";
				$("#height").append(Height);
			}
		},
		error: function(err) {
			return;
		}
	});
	$.ajax({
		url: baseUrl + "/view/" + SID + "/weight",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var Height = "<p span class=\"style_08\">" + res[x].weight + " " + res[x].unit + "</span> </p>";
				$("#height").append(Height);
			}
		},
		error: function(err) {
			return;
		}
	});
	var BMI = "<span class=\"style_08\">" + BMI[IND] + "</span> </p>";
	$("#bmi").append(BMI);
	$.ajax({
		url: baseUrl + "/view/" + SID + "/blood_pressure",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var Pressure = "<span class=\"style_09\">" + res[x].systolic + " || " + res[x].diastolic + "</span> </p>";
				$("#pressure").append(Pressure);
			}
		},
		error: function(err) {
			return;
		}
	});
	$.ajax({
		url: baseUrl + "/view/" + SID + "/spO2",
		type: 'GET',
		headers: {
		"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var Oxydation = "<span class=\"style_09\">" + res[x].spO2 + "</span> </p>";
				$("#oxydation").append(Oxydation);
			}
		},
		error: function(err) {
			return;
		}
	});
	displayLocation ();
	displayGraphs ();
}

function clean_info () {
	element = document.getElementById("patient-pic");
	element.innerHTML = '';
	element = document.getElementById("data");
	element.innerHTML = '';
	element = document.getElementById("nurse-pic");
	element.innerHTML = '';
	element = document.getElementById("height");
	element.innerHTML = '';
	element = document.getElementById("weight");
	element.innerHTML = '';
	element = document.getElementById("bmi");
	element.innerHTML = '';
	element = document.getElementById("pressure");
	element.innerHTML = '';
	element = document.getElementById("oxydation");
	element.innerHTML = '';
}

function clean_graph () {
	element = document.getElementById("graph");
	element.innerHTML = '';
}

function displayGraphs () {
	clean_graph();
		
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
		
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);
		
	var y = d3.scale.linear()
		.range([height, 0]);
		
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");
		
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10, "%");
		
	var svg = d3.select("#graph").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	d3.tsv("data.tsv", type, function(error, data) {
		x.domain(data.map(function(d) { return d.letter; }));
		y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
		
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
		
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Frequency");
		
	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.letter); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y(d.frequency); })
		.attr("height", function(d) { return height - y(d.frequency); });
	});
}

function type (d) {
	d.frequency = +d.frequency;
	return d;
}
