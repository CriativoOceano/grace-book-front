import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// A sessão agora é um cookie httpOnly (não mais um token em localStorage
// lido aqui e anexado manualmente). O navegador já manda o cookie
// sozinho, desde que a requisição peça `withCredentials`. O header
// X-Requested-With serve de defesa contra CSRF: o back-end só aceita
// requisições que mudam estado, vindas com o cookie de sessão, se esse
// header customizado estiver presente, algo que um site malicioso não
// consegue forjar com um <form> comum.
//
// Isso só pode ser aplicado em chamadas para o nosso próprio backend.
// Em requisições a terceiros (ex.: ViaCEP), mandar withCredentials numa
// chamada cross-origin faz o navegador exigir que o servidor responda com
// Access-Control-Allow-Credentials, o que APIs públicas como o ViaCEP não
// fazem — a requisição inteira falha por causa disso.
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authReq = req.clone({
    withCredentials: true,
    headers: req.headers.set('X-Requested-With', 'XMLHttpRequest'),
  });
  return next(authReq);
};
