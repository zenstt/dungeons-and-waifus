"use strict";
$(document).ready(function () {
    let timer = null;
    let last_user = localStorage.getItem('user_selected');
    if (last_user){
        $('#inputUser').val(last_user);
        $('#rememberMe').prop("checked",true);
    } 
    $('#signIn').click(function (e) {
        let user = $('#inputUser').val();
        let pass = $('#inputPassword').val();
        if (user && pass) {
            e.preventDefault();
            $.ajax({
                type: "POST",
                url: '/logIn',
                data: {
                    user: user,
                    pass: pass
                },
                success: function (data) {
                    if (data && data.status == 'ok') {
                        if (data.data.token) {
                            let checkbox = $('#rememberMe').prop("checked");
                            if (checkbox) {
                                localStorage.setItem('user_selected', user);
                            } else {
                                localStorage.removeItem('user_selected', user);
                            }
                            localStorage.setItem('token', data.data.token);
                            location.href = "/game/";
                        } else {
                            $('#textError').text("An error has occurred. Try again later");
                            $('#textError').fadeIn();
                            if (timer) clearTimeout(timer);
                            timer = setTimeout(function () {
                                $('#textError').fadeOut();
                            }, 2000);
                        }
                    } else {
                        $('#textError').text(data.err);
                        $('#textError').fadeIn();
                        if (timer) clearTimeout(timer);
                        timer = setTimeout(function () {
                            $('#textError').fadeOut();
                        }, 2000);
                    }
                },
                error: function () {
                    $('#textError').text("We can't sign you in right now. Try again later");
                    $('#textError').fadeIn();
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function () {
                        $('#textError').fadeOut();
                    }, 2000);
                }
            });
        } else {
            if (!user) $('#inputUser').addClass('is-invalid');
            if (!pass) $('#inputPassword').addClass('is-invalid');
        }
    });
})