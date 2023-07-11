## Flow image

```txt
# https://sequencediagram.org/
title 第三方綁定登入

actor User
participant Third-Party Service Client
participant Qubic Connect(SDK)
participant Qubic Connect(Auth Web)
control Third-Party Service Backend
database Third-Party Service Database
participant Qubic Auth Admin API


opt 首次綁定帳號
User->Third-Party Service Client: 點擊綁定帳號
Third-Party Service Client->Qubic Connect(SDK):呼叫 bind 方法\nbindWithRedirect()
Qubic Connect(SDK)->Qubic Auth Admin API:https://admin.qubic.market/market/services/graphql-public\nGQL clientTicketIssue()\n
Qubic Connect(SDK)<--Qubic Auth Admin API:return {ticket, expiredAt}
Qubic Connect(SDK)->Qubic Connect(Auth Web):重導到 https://auth.qubic.app/\n包含 clientTicket
Qubic Connect(Auth Web)-->User:跳轉到登入畫面
User->Qubic Connect(Auth Web):選取登入方式
Qubic Connect(Auth Web)->Qubic Auth Admin API:呼叫登入 REST API，\npayload 是 querystring.stringify 非 JSON.stringify\n\nheader 都要包含 \nheader {`X-Qubic-Client-Ticket:$clientTicket`}\n\nhttps://admin.qubic.market/market/services/auth \npayload \nquerystring.stringify({\n  provider: 'wallet',\n  address,\n  signature,\n  data\n})\n\n\nhttps://admin.qubic.market/market/services/auth/qubic\npayload \nquerystring.stringify({\n  address,\n  ticket,\n})\n\n
Qubic Auth Admin API-->Qubic Connect(Auth Web):return { clientId, merchantName, clientIconUrl, accessToken, expiredAt }
Qubic Connect(Auth Web)-->User:跳轉到是否綁定服務畫面
User->Qubic Connect(Auth Web):同意
Qubic Connect(Auth Web)->Qubic Auth Admin API:呼叫綁定 API \nhttps://creator.qubic.app/market/graphql\nGQL primeBind()\n\nheader { `X-Qubic-Client-Ticket:$clientTicket`, accessToken }\npayload no\n
Qubic Auth Admin API-->Qubic Connect(Auth Web):return { bindTicket, expireTime }
Qubic Connect(SDK)<--Qubic Connect(Auth Web):return {bindTicket, expireTime}
Qubic Connect(SDK)-->Third-Party Service Client:初始化 qubicConnect 後，綁定事件\n\nqubicConnect.onBindTicketResult((result, error) => {\n  const { bindTicket, expireTime } = result\n})\n\nbindTicket 是臨時取得一個值，目的在換取永久的 Prime\nPrime 是可以用來取得，作為登入使用的 credential
Third-Party Service Client->Third-Party Service Backend:傳送 bindTicket
Third-Party Service Backend->Qubic Auth Admin API:呼叫取得 Prime API\nhttps://creator.qubic.app/admin/graphql\nGQL primeGet(bindTicket)\n這個動作必須要用 server side 執行\n
Qubic Auth Admin API-->Third-Party Service Backend:return { prime, user: { address } }
Third-Party Service Backend->Third-Party Service Database:妥善保管 address, prime 存放在資料庫\n對應到第三方服務的會員
Third-Party Service Database-->Third-Party Service Backend: 資料寫入完成

note over User, Qubic Auth Admin API: 這邊可以參考下方，[尚未登入]流程行實作，立刻取得 credential 並執行 signInWithCredential


Third-Party Service Backend-->Third-Party Service Client: 綁定完成
Third-Party Service Client-->User: 顯示綁定成功資訊
end

note over User, Qubic Auth Admin API: 用戶要使用任何 Creator 商城功能或 API 之前，自動幫用戶登入

Third-Party Service Client->Qubic Connect(SDK): 確定是否登入？
alt 尚未登入
Qubic Connect(SDK)-->Third-Party Service Client: accessToken 不存在
Third-Party Service Client->Third-Party Service Backend: 取得 credential\n要帶入跟當初綁定時相同的會員資訊
Third-Party Service Backend->Third-Party Service Database:讀取 prime
Third-Party Service Database-->Third-Party Service Backend:return prime
Third-Party Service Backend->Qubic Auth Admin API:呼叫生成 Credential API\nhttps://creator.qubic.app/admin/graphql\nGQL credentialIssue (prime)\n這個動作必須要用 server side 執行\n
Qubic Auth Admin API-->Third-Party Service Backend:return credential = { identityTicket, expiredAt, user: { address } }
Third-Party Service Backend-->Third-Party Service Client: 回傳 credential
Third-Party Service Client->Qubic Connect(SDK):呼叫登入方法\nloginWithCredential(credential)
Qubic Connect(SDK)->Qubic Auth Admin API:呼叫登入 API\nhttps://admin.qubic.market/market/services/auth/prime \npayload { identityTicket, address }\n
Qubic Connect(SDK)<--Qubic Auth Admin API:return { accessToken, expiredAt, isQubicUser }
Qubic Connect(SDK)-->Third-Party Service Client:登入成功\nqubicConnect.onAuthStateChanged((user, error) => {\n  const {\n    method,\n    address,\n    accessToken,\n    expiredAt,\n    provider,\n    qubicUser: {provider, email}\n  } = user\n})
else 已經登入
Qubic Connect(SDK)-->Third-Party Service Client:登入成功\nqubicConnect.onAuthStateChanged((user, error) => {\n  const {\n    method,\n    address,\n    accessToken,\n    expiredAt,\n    provider,\n    qubicUser: {provider, email}\n  } = user\n})
end
```
