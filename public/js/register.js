"use strict";
"use strict";
$(document).ready(function () {
    let timer = null;
    $('#register').click(function (e) {
        let user = $('#inputUser').val();
        console.log('user: ', user);
        let pass = $('#inputPassword').val();
        console.log('pass: ', pass);
        let email = $('#inputEmail').val();
        console.log('email: ', email);
        let pass_repeat = $('#inputPassword_repeat').val();
        console.log('pass_repeat: ', pass_repeat);
        if (user && pass && email && pass_repeat) {
            e.preventDefault();
            if (pass != pass_repeat) {
                $('#inputPassword').addClass('is-invalid');
                $('#inputPassword_repeat').addClass('is-invalid');
                $('#textError').text("Password doesn't match");
                $('#textError').fadeIn();
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    $('#textError').fadeOut();
                }, 5000);
                return;
            } else {
                $('#inputPassword').removeClass('is-invalid');
                $('#inputPassword_repeat').removeClass('is-invalid');
            }

            $.ajax({
                type: "POST",
                url: '/register',
                data: {
                    user: user,
                    pass: pass,
                    email: email
                },
                success: function (data) {
                    if (data && data.status == 'ok') {
                        localStorage.setItem('user_selected', user);
                        location.href = "/";
                    } else {
                        $('#textError').text(data.err);
                        $('#textError').fadeIn();
                        if (timer) clearTimeout(timer);
                        timer = setTimeout(function () {
                            $('#textError').fadeOut();
                        }, 5000);
                    }
                },
                error: function () {
                    $('#textError').text("We can't register you in right now. Try again later");
                    $('#textError').fadeIn();
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function () {
                        $('#textError').fadeOut();
                    }, 5000);
                }
            });
        } else {
            if (!user) {
                $('#inputUser').addClass('is-invalid');
            } else {
                $('#inputUser').removeClass('is-invalid');
            }
            if (!email) {
                $('#inputEmail').addClass('is-invalid');
            } else {
                $('#inputEmail').removeClass('is-invalid');
            }
            if (!pass) {
                $('#inputPassword').addClass('is-invalid');
            } else {
                $('#inputPassword').removeClass('is-invalid');
            }
            if (!pass_repeat) {
                $('#inputPassword_repeat').addClass('is-invalid');
            } else {
                $('#inputPassword_repeat').removeClass('is-invalid');
            }
        }
    });
})