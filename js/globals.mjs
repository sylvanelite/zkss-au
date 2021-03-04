

export default  {
	BASE_URL:"./node/server.mjs",    //URL of the AJAX endpoint
    varArea:"42",           //filter out messages to only be from this room. currently unused.
    varWaitingForMessage:false,//flag for when "get" is sent. In the event get takes longer than the poll timer, this will skip additional calls until the first has returned.
    varMessagePollTime:1000,//time in ms between polling the server for messages
    varMessageId:0,         //ID for getting server messages up to this value
    getMessageTimer:0,      //timer that counts down between messages
    varMessageBuffer:[],    //if multiple messages arrive between polls, they are buffered here
    varPlayerId:"",         //the ID of your player (alpha)
    varPlayers:{},          //list of player objects, stored by IDs
    varTasks:{},            //list of tasks for every player, in the form playerId_idx
    varVotes:[],                //count of global votes cast during a meeting
    TIME_BETWEEN_MEETING:30000, //30 seconds between entering a meeting and calling another
    TIME_BETWEEN_KILL:30000,    //30 seconds between kills for imposter
    TIME_BETWEEN_SABOTAGE:30000,//duration of sabotaged events
    TIME_LOOK_AT:3000,          //number of seconds the action button will be visible after a scan
    IMPOSTER_NUMBER:1,          //initial number of imposters
    TASK_NUMBER:8,              //initial number of tasks per player
    MAP_RENDER_SIZE:320,        //square size for the map image to be scaled to
    //https://www.the-qrcode-generator.com/
    EVENTS:{
        JOIN:"JOIN",
        START:"START",
        CLEAR_TASK:"CLEAR_TASK",
        KILL:"KILL",
        MEETING:"MEETING",
        SABOTAGE:"SABOTAGE",
        VOTE:"VOTE",
        TAG_INFO:"TAG_INFO"
    },
    TASKS:{
        KILL:"Kill",
        SABOTAGE:"Sabotage",
        TASK:"Task",
        INTERACT:"Interact",
        MEETING:"Meeting",
        VIEW_LOG:"Logs"
    },
    /*
    runtime additions:
    Au.states = {};
    Au.states.stateLobby = new StateLobby();
    Au.states.stateMainMenu = new StateMainMenu();
    Au.states.stateMeeting = new StateMeeting();
    Au.states.statePlaying = new StatePlaying();
    Au.states.stateTask = new StateTask();
    Au.states.stateViewLog = new StateViewLog();
    Au.state = {};//current state
    */
    getRandomString:function(length){
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let res ="";
        for(let i=0; i<length; i+=1) {
           res += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return res;
    }
};

