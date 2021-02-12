const express = require("express");
const cors = require("cors");

const { uuid,isUuid } = require("uuidv4");

const app = express();

 // Definição de um Middleware (meu primeiro)
 // obs: O parametro next abaixo, é para que uma vez que interceptado na rota global, o aplicativo possa seguir sua linearidade, caso controria pararia aqui e não passaria nas demais rotas (não globais)
 function logRequests (request, response, next){
  const { method, url } = request;
  const {likes} = request.body;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.log(logLabel);

  // if (method === "PUT" ){
  //   // likes preenchidos
  //   if (likes) {
  //     return response.status(400).json({error: 'Prohibited action.'});
  //   }    
  // }

  return next(); // proximo middleware
 }


 // Definição de um Middleware (meu segundo)
 // obs: O parametro next abaixo, é para que uma vez que interceptado na rota global, o aplicativo possa seguir sua linearidade, caso controria pararia aqui e não passaria nas demais rotas (não globais)
 function validateRepositoryID (request, response, next){
  const { id } = request.params;
  
  if(!isUuid(id)){
    
    // Obs.: sempre que um "return response" é invocado, nenhum codido abaixo será executado, ele interrompe a execução para voltar o feedback ao chamador
    return response.status(400).json({error: 'Invalid repository ID.'});
  }

  return next(); // proximo middleware
 }


app.use(express.json());
app.use(cors());
app.use(logRequests);
//usando um middleware para uma rota especifica 
// obs.: Posso passar mais de um middleware para uma rota, basta colocar a virgula depois do validateProjectID abaixo e informar o segundo...
app.use('/repositories/:id', validateRepositoryID);

const repositories = [];

app.get("/repositories", (request, response) => {
  const {title} = request.query;

  const results = title 
    ? repositories.filter( repository => repository.title.includes(title))
    : repositories;

  return response.json(results);
});



app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title,
    url, 
    techs, 
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);

});



app.put("/repositories/:id", (request, response) => {
  let {id} = request.params;
  let {title, url, techs, } = request.body;

  // captura a posição de um vetor 
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if ( repositoryIndex < 0){
    return response.status(404).json({error: 'Repository not found.'})

  }

  
  const repository = repositories[repositoryIndex];
  
 // alterando objeto com as novas informacoes 
  repository.title=title;
  repository.url=url;
  repository.techs=techs;


  // re-adicionando o objeto alterado ao array
  repositories[repositoryIndex] = repository;

  return response.json(repository);
});




app.delete("/repositories/:id", (request, response) => {
  let {id} = request.params;
 
  // captura a posição de um vetor 
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0){
    return response.status(404).json({error: 'Repository not found.'})

  }

  repositories.splice(repositoryIndex,1);

  return response.status(204).send();
});




app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;

  const repository = repositories.find(repository => repository.id === id);

  // se repository igual a undefined, ou seja, diferente de preenchida...retorna erro
  if (!repository){
    return response.status(400).send();

  }

  

  repository.likes += 3;

  return response.json(repository);


});

module.exports = app;
