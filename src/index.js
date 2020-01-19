const axios = require("axios");
const swal = require('sweetalert2');

class App {
  constructor() {

    this.buttonCreate = document.getElementById("btn_create");
    this.buttonEdit = document.getElementById("btn_edit");
    this.buttonOpenLogin = document.getElementById("btn_open_login");
    this.buttonOpenCadastro = document.getElementById("btn_open_cadastro");
    this.title = document.getElementById("input_title");
    this.content = document.getElementById("input_content");
    this.buttonLogin = document.getElementById("btn_login");
    this.buttonCadastrar = document.getElementById("btn_cadastrar");

    //this.url = 'http://localhost:3333/cards/';
    //this.urllogin = 'http://localhost:3333/login';
    this.url = 'https://authencation-jwt-node-growdev.herokuapp.com/cards/';
    this.urllogin = 'https://authencation-jwt-node-growdev.herokuapp.com/login';
    this.urlusers = 'https://authencation-jwt-node-growdev.herokuapp.com/users';
    this.token = { headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') } };
    this.cardEditing = [1];
    this.getScraps();
    //this.getScraps(this, null);
    this.registerEvents();
  }
  registerEvents() {
    this.buttonCreate.onclick = (event) => this.createCard(event, this);
    this.buttonEdit.onclick = (event) => this.editCard(event, this);
    this.buttonLogin.onclick = (event) => this.efetuarLogin(event, this);
    this.buttonOpenCadastro.onclick = (event) => this.openCadastro(event);
    this.buttonOpenLogin.onclick = (event) => this.login();
    this.buttonCadastrar.onclick = (event) => this.efetuarCadastro(event, this);
  }

  registerButtons() {
    document.querySelectorAll('.delete-card').forEach(item => {
      item.onclick = event => this.deleteCard(event, this);
    });

    document.querySelectorAll('.edit-card').forEach(item => {
      item.onclick = event => this.openEditCard(event);
    });

    console.log("register buttons");
  }

  async getScraps() {
    try {
      const response = await axios.get(this.url, this.token)
      if (response.data) {
        this.recoveryScraps(response.data);
      }
    } catch (error) {
      console.log(error);
      swal("Realize login na página!", "", "info")
    }
  }

  recoveryScraps(data) {
    for (item of data) {
      const html = this.cardLayout(item.id, item.title, item.content);

      this.insertHtml(html);
    }

    this.registerButtons();
  }

  openCadastro() {
    $('#cadastroModal').modal('show');
  }

  login() {
    // event.preventDefault();
    $('#LoginModal').modal('show');
  }

  efetuarLogin(event, app) {
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;

    axios.post(this.urllogin, {
      email: email,
      password: password
    })
      .then(function (response) {
        swal("Login efetuado com sucesso!", "", "success");
        $("#LoginModal").modal('hide');
        app.token = { headers: { 'Authorization': 'Bearer ' + response.data.token } };
        sessionStorage.setItem('token', response.data.token);

        app.getScraps(app, response.data.token);
      })
      .catch(function (error) {
        console.log(error);
        swal("Login inválido!", "", "error");
      })
      .finally(function () {
      });
  }

  efetuarCadastro(event, app) {
    const cad_nome = document.getElementById('cad_nome').value;
    const cad_email = document.getElementById('cad_email').value;
    const cad_password = document.getElementById('cad_password').value;

    axios.post(this.urlusers, {
      name: cad_nome,
      email: cad_email,
      password: cad_password
    })
      .then(function (response) {
        swal('Cadastro Efetuado com sucesso', '', 'success');
        $("#cadastroModal").modal('hide');
        app.login();
      })
      .catch(function (error) {
        console.log(error);
        swal("Cadastro inválido!", "", "error");
      })
      .finally(function () {
      });


  }

  createCard(event) {
    event.preventDefault();


    if (this.title.value && this.content.value) {
      this.sendToServer(this);
    } else {
      swal("Preencha os campos!", "", "error");
    }
  }

  async sendToServer() {
    try {
      const response = await axios.post(this.url, {
        title: this.title.value,
        content: this.content.value
      }, this.token);
      if (response.data) {
        const { id, title, content } = response.data;
        let html = this.cardLayout(id, title, content);

        this.insertHtml(html);
        this.clearForm();
        this.registerButtons();
      }
    } catch (error) {
      swal('Erro! Card não criado.', '', 'error');
    }
  }


  cardLayout(id, title, content) {
    const html = `
            <div class="col mt-5" scrap="${id}">
                <div class="card">
                    <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${content}</p>
                    <button type="button" class="btn btn-danger delete-card">Excluir</button>
                    <button type="button" class="btn btn-primary edit-card" data-toggle="modal" data-target="#editModal" >Editar</button>
                    </div>
                </div>
            </div>
        `;

    return html;
  }

  insertHtml(html) {
    document.getElementById("row_cards").innerHTML += html;
  }

  clearForm() {
    this.title.value = "";
    this.content.value = "";
  }

  deleteCard = (event, app) => {
    const id = event.path[3].getAttribute('scrap');
    axios.delete(`${this.url}${id}`, app.token)
      .then(function (response) {
        event.path[3].remove();
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
      });
  };

  openEditCard = (event) => {
    const id = event.path[3].getAttribute('scrap');
    const title = event.path[1].children[0].innerHTML;
    const content = event.path[1].children[1].innerHTML;

    document.getElementById("edit_title").value = title;
    document.getElementById("edit_content").value = content;
    document.getElementById("edit_id").value = id;

    this.cardEditing = event.path[1];
    this.cardEditing.editId = id;
  };

  editCard = async (event) => {
    const id = this.cardEditing.editId;
    const title = document.getElementById("edit_title").value;
    const content = document.getElementById("edit_content").value;
    try {
      const response = await axios.put(`${this.url}${id}`, {
        title: title,
        content: content
      }, this.token);

      this.cardEditing.children[0].innerHTML = title
      this.cardEditing.children[1].innerHTML = content
    }
    catch (error) {
      console.log(error);
      swal("Parece que ocorreu um erro!", "", "error");
    }
  }
}

new App();
