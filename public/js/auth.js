var currentPage = "login";
var globalLoading = false;

$("#loginButton").click(function (e) {
  e.preventDefault();
  performLogin();
});

$("#loginForm").submit(function (e) {
  e.preventDefault();
  performLogin();
});

function performLogin() {
  $("#emailError").hide();
  $("#passwordError").hide();
  $("#passwordInput").removeClass("red-border");
  $("#emailInput").removeClass("red-border");
  setLoading(true);

  const email = $("#emailInput").val();
  const password = $("#passwordInput").val();

  const isEmail = validateEmail(email);

  if (!isEmail) {
    $("#emailInput").addClass("red-border");
    $("#emailError").text("Invalid email provided");
    $("#emailError").fadeIn(200);
    setLoading(false);
    return;
  }

  if (email !== undefined && password != undefined) {
    var errorOccured = false;
    if (email.trim() === "") {
      $("#emailInput").addClass("red-border");
      $("#emailError").text("Invalid email provided");
      $("#emailError").fadeIn(200);
      setLoading(false);
      errorOccured = true;
    }
    if (password.trim() === "") {
      $("#passwordInput").addClass("red-border");
      $("#passwordError").text("Invalid email provided");
      $("#passwordError").fadeIn(200);
      setLoading(false);
      errorOccured = true;
    }
    if (errorOccured) {
      return;
    } else {
      chrome.runtime.sendMessage(
        "",
        {
          message: "login",
          payload: {
            email: email,
            password: password,
          },
        },
        function (response) {
          if (response.message == "success") {
          }
        }
      );
    }
  } else {
    $("#emailInput").addClass("red-border");
    $("#emailError").text("Invalid email provided");
    $("#emailError").fadeIn(200);
    $("#passwordInput").addClass("red-border");
    $("#passwordError").text("Invalid email provided");
    $("#passwordError").fadeIn(200);
    setLoading(false);
  }
}

// $("#changePageButton").click(function (e) {
//   e.preventDefault();

//   if (currentPage == "login") {
//     currentPage = "register";
//   } else {
//     currentPage = "login";
//   }
//   changeContent(currentPage);
// });

$("#changePageButtonRegister").click(function (e) {
  e.preventDefault();

  if (currentPage == "login") {
    currentPage = "register";
  } else {
    currentPage = "login";
  }
  changeContent(currentPage);
});

function setLoading(loading) {
  globalLoading = loading;
  if (currentPage == "login") {
    if (loading) {
      $("#loginButtonText").hide();
      $("#loginButtonSpinner").show();
    } else {
      $("#loginButtonText").show();
      $("#loginButtonSpinner").hide();
    }
  } else {
    if (loading) {
      $("#loginButtonTextRegister").hide();
      $("#registerButtonSpinner").show();
    } else {
      $("#loginButtonTextRegister").show();
      $("#registerButtonSpinner").hide();
    }
  }
}

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function changeContent(page) {
  if (page === "login" && !globalLoading) {
    $(".register-container").hide();
    $(".login-container").fadeIn(200);
  } else if (page === "register" && !globalLoading) {
    $(".login-container").hide();
    $(".register-container").css("display", "flex").hide().fadeIn(200);
  }
}

$("#registerButton").click(function (e) {
  e.preventDefault();
  setLoading(true);
  const name = $("#nameInput").val();
  const email = $("#emailInputRegister").val();
  const password = $("#passwordInputRegister").val();
  chrome.runtime.sendMessage(
    "",
    {
      message: "register",
      payload: {
        name: name,
        email: email,
        password: password,
      },
    },
    function (response) {
      if (response.message == "success") {
        setLoading(false);
        changeContent("login");
      }
    }
  );
});
