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
participant "Qubic Auth Admin Api" as adminApi

entryspacing 1.0

## loginWithRedirect
note over client, wallet: loginWithRedirect

client->sdk:loginWithRedirect\n
	sdk->auth:navigate to auth web\n{\n  action: 'login' \n  walletType\n  qubicSignInProvider\n  redirectUrl\n  apiKey\n  dataString\n\n}

	alt Qubic Wallet and has redirectUrl
		auth->wallet:navigate to wallet\n{\n  ticketRedirectUrl,\n  provider: 'facebook' | 'google' | 'apple' | 'yahoo'\n}
wallet->wallet:sign in success and get ticket from wallet service
		sdk<--wallet:response\n{\n  action: 'login'\n  accountAddress\n  signature: ticket\n  dataString\n  isQubicUser: true\n}\n// when isQubicUser true signature would be a ticket from wallet service\n
	else WalletConnect/Metamask
		auth->auth:active wallet and sign
		sdk<--auth:response\n{\n  action: 'login'\n  accountAddress\n  signature\n  dataString\n  isQubicUser: false\n\n}

end

sdk->sdk:handleRedirectUrl\n
sdk->adminApi:以 qubic wallet 登入\n/services/auth/qubic\npayload {address,ticket} \n\n其他錢包登入\n/services/auth\npayload {provider, signature, address data}
sdk<--adminApi:response {accessToken, expiredAt, isQubicUser}
sdk->sdk
client<--sdk:trigger onAuthChanged\n{\n  method\n  address\n  accessToken\n  expiredAt\n  provider\n  qubicUser\n}

## bindWithRedirect

note over client, adminApi: bindWithRedirect


client->sdk:bindWithRedirect\n
sdk->adminApi:clientTicketIssue\n
sdk<-adminApi:response { ticket, expiredAt }
	sdk->auth:navigate to auth web\n{\n  action: 'bind'\n  clientTicket\n  walletType\n  qubicSignInProvider\n  redirectUrl\n  apiKey\n  dataString\n}\n\n


else action:bind
	alt Qubic Wallet
    auth->wallet:navigate to wallet\n{\n  ticketRedirectUrl,\n  provider: 'facebook' | 'google' | 'apple' | 'yahoo'\n}
    wallet->wallet:sign in success and get ticket from wallet service
	auth<--wallet:response\n{\n  ticket\n  expiredAt\n  address\n}
    else WalletConnect/Metamask
		auth->auth:active wallet and sign
	end
auth->adminApi:以 qubic wallet 登入\n/services/auth/qubic\npayload {address,ticket} \n\n其他錢包登入\n/services/auth\npayload {provider, signature, address data} \n\n帶入 clientTicket \nheaders { X-Qubic-Client-Ticket }
auth<--adminApi:response {accessToken, expiredAt, isQubicUser, clientId, merchantName, clientIconUrl}
	auth->auth:show confirm auhtorized to user\n
auth->adminApi:gql PrimeBind \nheaders { X-Qubic-Client-Ticket }
auth<--adminApi:response { bindTicket, expireTime }
	sdk<--auth:response \n{\n  action: 'bind',\n  bindTicket: string,\n  expiredAt: number\n}


sdk->sdk:handleRedirectUrl\n

client<--sdk:trigger onBindTicketResult\n{\n  bindTicket,\n  expiredAt,\n}
client->clientService:sendBindToken to client service
client<--clientService:bind success with credential\n{\n  identityTicket,\n  expiredAt,\n  address\n}

note over client,adminApi:After binding success, you can login with client service

client->clientService:login
client<--clientService:response with credential\n{\n  identityTicket,\n  expiredAt,\n  address\n}
client->sdk:loginWithCredential
sdk->adminApi:/services/auth/prime\npayload {identityTicket, address}\n
sdk<--adminApi:response {accessToken, expiredAt, isQubicUser}
client<--sdk:trigger onAuthChanged\n{\n  method\n  address\n  accessToken\n  expiredAt\n  provider\n  qubicUser\n}

```
