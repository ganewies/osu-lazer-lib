var SRBaseURL = "https://spectator.osu.ppy.sh/";
var BaseURL   = "https://osu.ppy.sh";

export default {
    BaseURL,
    SRBaseURL, // 'signalr base url' it means

    SpectatorURL: SRBaseURL+"spectator",
    MpURL: SRBaseURL+"multiplayer",
    MdURL: SRBaseURL+"metadata",

    BmSubmitURL: "https://bss.ppy.sh" // not necessarily necessary but why not 
}