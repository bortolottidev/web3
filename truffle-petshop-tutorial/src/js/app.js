App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    $.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");

      for (i = 0; i < data.length; i++) {
        petTemplate.find(".panel-title").text(data[i].name);
        petTemplate.find("img").attr("src", data[i].picture);
        petTemplate.find(".pet-breed").text(data[i].breed);
        petTemplate.find(".pet-age").text(data[i].age);
        petTemplate.find(".pet-location").text(data[i].location);
        petTemplate.find(".btn-adopt").attr("data-id", data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // modern dapp
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        console.log("requesting acc..");
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        window.web3 = new Web3(window.ethereum);
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    } else if (window.web3) {
      console.log("web3 x_x");
      // legacy dapp
      App.web3Provider = window.web3.currentProvider;
    } else {
      console.log("ganache!");
      // its ganache boyss
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    return App.initContract();
  },

  initContract: function () {
    // am i really using jquery?
    $.getJSON("Adoption.json", function (data) {
      const AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      App.contracts.Adoption.setProvider(App.web3Provider);

      return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-adopt", App.handleAdopt);
  },

  markAdopted: function () {
    let adoptionInstance;

    App.contracts.Adoption.deployed()
      .then((instance) => {
        adoptionInstance = instance;
        return adoptionInstance.getAdopters.call();
      })
      .then((adopters) => {
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] === "0x0000000000000000000000000000000000000000")
            return;

          $(".panel-pet")
            .eq(i)
            .find("button")
            .text("Success")
            .attr("disabled", true);
        }
      })
      .catch((err) => console.log(err.message));
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));

    let adoptionInstance;

    console.log([web3, App]);
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log({ accounts });

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(function (result) {
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
