Components.utils.import("resource:///modules/imXPCOMUtils.jsm");
Components.utils.import("resource:///modules/jsProtoHelper.jsm");

function Conversation(aAccount)
{
  this._init(aAccount);
}
Conversation.prototype = {
  _disconnected: false,
  _setDisconnected: function() {
    this._disconnected = true;
  },
  close: function() {
    if (!this._disconnected)
      this.account.disconnect(true);
  },
  sendMsg: function (aMsg) {
    if (this._disconnected) {
      this.writeMessage("talker", "This message could not be sent because the conversation is no longer active: " + aMsg, {system: true, error: true});
      return;
    }

    this.writeMessage("You", aMsg, {outgoing: true});
    this.writeMessage("/dev/null", "Thanks! I appreciate your attention.",
                      {incoming: true, autoResponse: true});
  },

  get name() "/dev/null",
};
Conversation.prototype.__proto__ = GenericConvIMPrototype;

function Account(aProtoInstance, aImAccount)
{
  this._init(aProtoInstance, aImAccount);
}
Account.prototype = {
  connect: function() {
    this.reportConnecting();
    // do something here
    this.reportConnected();
    setTimeout((function() {
      this._conv = new Conversation(this);
      this._conv.writeMessage("talker", "You are now talking to /dev/null", {system: true});
    }).bind(this), 0);
  },
  _conv: null,
  disconnect: function(aSilent) {
    this.reportDisconnecting(Components.interfaces.prplIAccount.NO_ERROR, "");
    if (!aSilent)
      this._conv.writeMessage("talker", "You have disconnected.", {system: true});
    if (this._conv) {
      this._conv._setDisconnected();
      delete this._conv;
    }
    this.reportDisconnected();
  },

  get canJoinChat() true,
  chatRoomFields: {
    channel: {label: "_Channel Field", required: true},
    channelDefault: {label: "_Field with default", default: "Default Value"},
    password: {label: "_Password Field", default: "", isPassword: true,
               required: false},
    sampleIntField: {label: "_Int Field", default: 4, min: 0, max: 10,
                     required: true}
  }
};
Account.prototype.__proto__ = GenericAccountPrototype;

function TalkerProtocol() { }
TalkerProtocol.prototype = {
  get normalizedName() "talker",
  get name() "TalkerApp",
  get iconBaseURI() "chrome://prpl-talker/skin/",
  options: {
    "text": {label: "Text option",    default: "foo"},
    "bool": {label: "Boolean option", default: true},
    "int" : {label: "Integer option", default: 42},
    "list": {label: "Select option",  default: "option2",
             listValues: {"option1": "First option",
                          "option2": "Default option",
                          "option3": "Other option"}}
  },
  usernameSplits: [
    {label: "Server", separator: "@", defaultValue: "default.server",
     reverse: true}
  ],
  getAccount: function(aImAccount) new Account(this, aImAccount),
  classID: Components.ID("{b42e7960-a996-11e3-a5e2-0800200c9a66}"),
};
TalkerProtocol.prototype.__proto__ = GenericProtocolPrototype;

const NSGetFactory = XPCOMUtils.generateNSGetFactory([TalkerProtocol]);
