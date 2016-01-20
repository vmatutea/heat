var status = {
        interval : 2000,
        slidingWindow : 30,
        layout : 'lft',
        running : true,
        t : undefined,
        advancedmode: false
};
var ue1 ={
		buffering : [],
		lbr : [],
		freeze_time : 0,
		freeze_timestamp : 0,
		freeze_count : 0,
		status : 0,
		bc_start: undefined,
		bc_end: undefined
};


var timeIndexL = 0;
var timeIndexLnoData = new Date();
var BrowserReload = 0;

$(document).ready( function() {
	console.log("Entering the ready function");
//1. Initialization variables

        timeIndexLnoData= new Date().getTime();
        if ( BrowserReload == 0 ) {
                console.log("Loading time");
                                for (var g=30 ; g > 0 ; g-- ) {
                                        ue1.buffering.push([timeIndexLnoData-g*1000,5/1,-1/1,null]);
                                        console.log("updatingData,initLBR",g);
                                        console.log("time:",timeIndexLnoData-g*1000);
                                } //for
        } //if


        // 2. graph definition
	ue1.graph = new Dygraph(document.getElementById("div_g1"),
		ue1.buffering, {
			colors	   : new Array( "rgb(0,169,212)", "rgb(137,186,23)","rgb(123,123,23)"),
			strokeWidth: 2,
			valueRange : [ 0, 25 ],
			drawXGrid : false,
                        axes : {
                                x : {   axisLabelFormatter : function (ms){
                                                return  new Date(ms).strftime('%H:%M:%S');},
                                        valueFormatter: function(ms) {
                                                return 'Time(' + new Date(ms).strftime('%H:%M:%S') + ')';},
                                        pixelsPerLabel: 100,
                                        axisLabelFontSize  : 12
                                                },
                                y : { axisLabelFormatter : function (y){
                                        if(y.toString().length == 1){
                                                return y;
                                        } else {
                                                return '';
                                        }
                                }}
                                },
				ylabel : 'C',
				labels : [ 'Time', 'UC', 'BC', '' ]
		});

			updatingData();

});// document.ready

function updatingData() {
	var luc=0; //length of serverdata
	var lbc=0; //lengt  of serverdata
	var n=0;	// index variables n,h,o in while loops
	var h=0;
	var o=0;

	var active = window.intervalId = setInterval(function() {
// ########################### Video Status #####################################################################
                        // ### BEGIN -> extract time for the case that no new SQL ue_data are present
                        timeIndexLnoDataOld = timeIndexLnoData;
                        timeIndexLnoData = new Date().getTime();
                        timeIndexLDelta = timeIndexLnoData - timeIndexLnoDataOld;
			// #### BEGIN-> SQL DB querry via Ajax/PHP -> sql table ue_data for Video Status ###
			var q1 = "SELECT * FROM temperature";

			$.ajax({
				url : 'php/getData.php',
				async : false,
				data : { query : q1 }
			})
			.fail(function(){
			console.log("updatingData,AJAX CALL ue_data FAIL at timeIndexL+timeIndexLDelta:",timeIndexL+timeIndexLDelta);
			})
			.done(function(data) {
				if (data[0] == "<") {
					var data = $.parseJSON($(data).html());
				} else {
					var data = $.parseJSON(data);
				}
                        // #### END -> SQL DB querry via Ajax/PHP ###
			//data will include: 0:timestamp, 1:ue_id, 2: stream_type, 3:starttime, 4:prebuffer_duration, 5:status_chang
                        // #### BEGIN-> Data Analyzes for Video Status ###
			luc=data.length;
			if (luc != 0) {
				for ( var i = 0; i < luc; i++) {
					setNewData(data[i]);
					//delete data from DB
//					setFollowingData(data[i]);
				} // for
			} else	{ // NO new data : include new timestamps for all UE's
				setFollowingData(-1);
				}
                	}); // !!! AJAX done function
			setDelete();
	}, 1000);
} // updating Data

function setNewData(data) { 
                ue1.buffering.push([((ue1.buffering[ue1.buffering.length-1][0])+timeIndexLDelta/1),data,0,null]);
		console.log("setNewData");
		timeDeleteL=timeIndexLDelta/1+(ue1.buffering[ue1.buffering.length-1][0])/1;
		i=0;
		while ( timeDeleteL - 30000 > ue1.buffering[i][0] ) {
                        ue1.buffering.shift();
                	i++;
               	} // while
		ue1.graph.updateOptions({
                 	'file' : ue1.buffering
        	});
}

function setFollowingData(u) {
	var i = 0;
	var timeDeleteL = 0;
        var last_status_uc=2;
	var last_status_bc=2;
	if ( u == -1 ) { //no New Data in SQL, new timestamp old status
 			last_status_uc = ue1.buffering[ue1.buffering.length-1][1];
                       	last_status_bc = ue1.buffering[ue1.buffering.length-1][2];
			ue1.buffering.push([((ue1.buffering[ue1.buffering.length-1][0])+timeIndexLDelta/1),last_status_uc/1,last_status_bc/1,null]);
		        timeDeleteL=timeIndexLDelta/1+(ue1.buffering[ue1.buffering.length-1][0])/1;
	} else { //new data in SQL, new timestamp old status for all ues beside the ue that changed the status
			last_status_uc = ue1.buffering[ue1.buffering.length-1][1]; 
    			last_status_bc = ue1.buffering[ue1.buffering.length-1][2];			
                    	ue1.buffering.push([timeIndexL,last_status_uc,last_status_bc,null]);
	timeDeleteL=timeIndexL;
	} //else
		i=0;
		while ( timeDeleteL - 30000 > ue1.buffering[i][0] ) {
                        ue1.buffering.shift();
                	i++;
               	} // while
		ue1.graph.updateOptions({
                 	'file' : ue1.buffering
        	});
}

function setDelete() {
			var q2 = "DELETE  FROM temperature";

$.ajax({
				url : 'php/getData.php',
				async : false,
				data : { query : q2 }
			})
			.fail(function(){
			console.log("updatingData,AJAX CALL ue_data FAIL at timeIndexL+timeIndexLDelta:",timeIndexL+timeIndexLDelta);
			})
			.done(function(data) {
                	}); // !!! AJAX done function

}

