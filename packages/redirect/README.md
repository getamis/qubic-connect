# qubic connect auth flow

```txt
# https://sequencediagram.org/
title Qubic Connect Auth Flow
bottomparticipants
participant "Client" as client
participant "Client Service" as clientService
participant "Qubic Connect SDK" as sdk
participant "Auth Web" as auth
participant "Qubic Wallet" as wallet

entryspacing 1.0

## loginWithRedirect
note over client, wallet: loginWithRedirect

client->sdk:loginWithRedirect\n
	sdk->auth:navigate to auth web\n{\n  action: 'login' \n  walletType\n  qubicSignInProvider\n  redirectUrl\n  dataString\n\n}

	alt Qubic Wallet and has redirectUrl
		auth->wallet:navigate to wallet\n{\n  ticketRedirectUrl,\n  provider: 'facebook' | 'google' | 'apple' | 'yahoo'\n}
wallet->wallet:sign in success and get ticket from wallet service
		sdk<--wallet:response\n{\n  action: 'login'\n  accountAddress\n  signature: ticket\n  dataString\n  isQubicUser: true\n}\n// when isQubicUser true signature would be a ticket from wallet service\n
	else WalletConnect/Metamask
		auth->auth:active wallet and sign
		sdk<--auth:response\n{\n  action: 'login'\n  accountAddress\n  signature\n  dataString\n  isQubicUser: false\n\n}

end

sdk->sdk:handleRedirectUrl\n
sdk->sdk:login with signature\nif it's Qubic wallet signature would be ticket
client<--sdk:trigger onAuthChanged\n{\n  method\n  address\n  accessToken\n  expiredAt\n  provider\n  qubicUser\n}

## bindWithRedirect

note over client, wallet: bindWithRedirect


client->sdk:bindWithRedirect\n
	sdk->auth:navigate to auth web\n{\n  action: 'bind'\n  walletType\n  qubicSignInProvider\n  redirectUrl\n  dataString\n}


else action:bind
	alt Qubic Wallet
    auth->wallet:navigate to wallet\n{\n  ticketRedirectUrl,\n  provider: 'facebook' | 'google' | 'apple' | 'yahoo'\n}
    wallet->wallet:sign in success and get ticket from wallet service
	auth<--wallet:response\n{\n  ticket\n  expiredAt\n  address\n}
    else WalletConnect/Metamask
		auth->auth:active wallet and sign
	end
auth->auth:login with signature or ticket
	auth->auth:show confirm auhtorized to user\n
	auth->auth:send request to get bind token
	sdk<--auth:response \n{\n  action: 'bind',\n  bindTicket: string,\n  expiredAt: number\n}


sdk->sdk:handleRedirectUrl\n
sdk->sdk
clientService<-sdk
client<--sdk:trigger onBindTicketResult\n{\n  bindTicket,\n  expiredAt,\n}
client->clientService:sendBindToken to client service
client<--clientService:bind success with credential\n{\n  identityTicket,\n  expiredAt,\n  address\n}

note over client, clientService: After binding success, you can login with client service

client->clientService:login
client<--clientService:response with credential\n{\n  identityTicket,\n  expiredAt,\n  address\n}
client->sdk:loginWithCredential
client<--sdk:trigger onAuthChanged\n{\n  method\n  address\n  accessToken\n  expiredAt\n  provider\n  qubicUser\n}



```
