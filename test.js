var data = {
  "secretId":"IdeckaSeTiZahcteloTuMas",
  "secret":"JeToZajimavejTokenAleJeTiKnicemuBlbecku",
  "profileId":"NetusimKdeSiToBzal",
  "updateTicketHref":"https://production.api.playtrailmakers.com/api/servers/123456/join/napodobne"
}
var arguments = {"name":"PlayerJoinNotification","version":1,"data":JSON.stringify(data).replace(/"/g, String.fromCharCode(92) + ("u") + ("0022"))}; 
var toAdd = {
  "type":1,
  "target":"notify",
  "arguments":[
     JSON.stringify(arguments).replace(/"/g, String.fromCharCode(92) + ("u") + ("0022"))
  ]
}     
console.log(JSON.stringify(toAdd).replace(/\\\\u/g, String.fromCharCode(92)+"u"));