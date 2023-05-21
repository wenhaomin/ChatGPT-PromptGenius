/**
 * Listeners and control functions. These functions define the behavior of elements on the page.
 */


function language_select_listener(selected_lan_code) {
    if (cur_lan_code !== selected_lan_code) {
        cur_lan_code = selected_lan_code;
        set_cookie('lancode', cur_lan_code, 30);
        switch_active_language(selected_lan_code);

        switch_language_listener();
        action_sidebar_bs.hide();
    }
}

function switch_active_language(selected_lan_code) {
    // Change the selected option of #language-select to the given lan_code.
    $('#nav-language-select').children('li').each((index, item) => {
        if ($(item).attr('lan-code') === selected_lan_code) {
            $(item).children('a').addClass('active');
        } else {
            $(item).children('a').removeClass('active');
        }
    });
}

function class_select_listener(selected_class_id) {
    if (cur_selected_class !== selected_class_id) {
        cur_selected_class = selected_class_id;
        set_cookie('selected_class', cur_selected_class, 30);
        switch_active_class(cur_selected_class);

        render_prompt_by_class(cur_selected_class, cur_lan_code);
        class_sidebar_bs.hide();
    }
}

function switch_active_class(selected_class_id, scroll) {
    if (selected_class_id === 'popular') {
        $('#top-banner').show('blind', 600);
    } else {
        $('#top-banner').hide('blind', 600);
    }

    var all_class_nav = $('.class-nav-link, .child-class-nav-link');
    all_class_nav.removeClass('active');
    all_class_nav.each((index, item) => {
        if ($(item).attr('class-id') === selected_class_id) {
            $(item).addClass('active');
            if (scroll) {
                $('#class-sidebar-scroller').scrollTop($(item).position().top - $('#class-sidebar-scroller').height() / 2);
            }
        }
    });
}

function load_cookie_class() {
    var saved_selected_class = get_cookie('selected_class');
    if (saved_selected_class !== "" && saved_selected_class !== undefined) {
        cur_selected_class = saved_selected_class;
    } else {
        cur_selected_class = "popular";
    }

    if (cur_username === "" && cur_selected_class === "user_fav") {
        cur_selected_class = "popular"
    }
}

function copy_btn_click_listener(btn, text) {
    copy_to_clipboard(text.trim());
    btn.find('.bi').switchClass('bi-clipboard', 'bi-clipboard-check-fill');
    setTimeout(() => {
        btn.find('.bi').switchClass('bi-clipboard-check-fill', 'bi-clipboard');
    }, 2000);
}

function example_btn_click_listener(btn, function_id, semantic_id, lan_code) {
    btn.find('.spinner-border').removeClass('d-none');
    btn.find('.bi').addClass('d-none');
    render_prompt_example_display(function_id, semantic_id, lan_code).then(() => {
        btn.find('.spinner-border').addClass('d-none');
        btn.find('.bi').removeClass('d-none');
    });
}

function gain_popularity_listener(card, function_id, semantic_id, lan_code, increase) {
    var pop_display = card.find('.popularity-badge span')
    var cur_pop = parseInt(pop_display.text());
    pop_display.text(cur_pop + increase);
    masonry_reload(card.parents('#prompt-display'), '.prompt-col');
    send_post(`increase_popularity`,
        {
            'lan_code': lan_code, 'function_id': function_id,
            'semantic_id': semantic_id, 'increase': increase
        });
}

function prompt_search_listener() {
    var search_text = validate_input($('#search-input-group'));
    if (search_text.length > 0) {
        action_sidebar_bs.hide();
        cur_selected_class = '';
        switch_active_class(cur_selected_class);
        render_prompt_by_string(search_text, cur_lan_code)
    }
}

function submit_clear_listener() {
    $('#submit-dialog input').val('');
    $('#submit-dialog textarea').val('');
}

function submit_enter_listener() {
    var func_desc = validate_input($('#submit-dialog-funcdesc-group'));
    var prompt_content = validate_input($('#submit-dialog-prompt-group'));
    var user_name = $('#submit-dialog-user-group input').val();
    if (func_desc.length > 0 & prompt_content.length > 0) {
        $('#submit-enter-btn-spinner').removeClass('d-none');
        send_post('/submit_function', {
            'func_desc': func_desc,
            'prompt_content': prompt_content,
            'user_name': user_name
        }).then(() => {
            $('#submit-enter-btn-spinner').addClass('d-none');
            $('#submit-ok-indicator').removeClass('d-none');
            setTimeout(() => {
                submit_dialog_bs.hide();
                $('#submit-ok-indicator').addClass('d-none');
                submit_clear_listener();
            }, 1000);
        });
    }
}

function prompt_fav_listener(btn, function_id, semantic_id, lan_code) {
    if (cur_username === "") {
        user_login_dialog_bs.show();
    } else {
        var prompt_card = btn.parents('.prompt-card');
        var fav_icon = btn.find('.bi');
        var prompt_indicator = {
            'function_id': function_id,
            'semantic_id': semantic_id,
            'lan_code': lan_code
        };
        if (fav_icon.hasClass('bi-bookmark')) {
            fav_icon.switchClass('bi-bookmark', 'bi-bookmark-check-fill');
            send_post('add_fav_prompt', prompt_indicator);
            gain_popularity_listener(prompt_card, function_id, semantic_id, lan_code, 2);
        } else {
            fav_icon.switchClass('bi-bookmark-check-fill', 'bi-bookmark');
            send_post('remove_fav_prompt', prompt_indicator);
            gain_popularity_listener(prompt_card, function_id, semantic_id, lan_code, -2);
        }
    }
}

function not_implemented_listener() {
    $('#warning-toast').find('span').text(warning_contents[cur_lan_code]['not_implemented']);
    warning_toast.show();
}

function register_click_listener() {
    var username_group = $('#login-username-group');
    var password_group = $('#login-password-group');
    var password_re_group = $('#login-password-repeat-group');
    var error_message = $('#register-error-message');
    error_message.addClass('d-none');
    $('#login-error-message').addClass('d-none');
    var spinner = $('#register-btn .spinner-border');

    if (password_re_group.hasClass('d-none')) {
        password_re_group.removeClass('d-none');
    } else {
        var username = validate_input(username_group);
        var password = validate_input(password_group, password_re_group);

        if (username.length > 0 && password.length > 0) {
            spinner.removeClass('d-none');
            send_post('register', {
                'username': username,
                'password': password
            }).then((data) => {
                spinner.addClass('d-none');
                if (data.message === 'success') {
                    user_login_dialog_bs.hide();
                    cur_username = data.username;
                    render_user_specific();
                    render_userfav_class_item();
                } else {
                    error_message.removeClass('d-none');
                    setTimeout(() => {
                        error_message.addClass('d-none');
                    }, 5000);
                }
            })
        }
    }
}

function login_click_listener() {
    var username_group = $('#login-username-group');
    var password_group = $('#login-password-group');
    var password_re_group = $('#login-password-repeat-group');
    var error_message = $('#login-error-message');
    error_message.addClass('d-none');
    $('#register-error-message').addClass('d-none');
    var spinner = $('#login-btn .spinner-border');

    if (!password_re_group.hasClass('d-none')) {
        $('#login-password-repeat-group').addClass('d-none');
    } else {
        var username = validate_input(username_group);
        var password = validate_input(password_group);

        if (username.length > 0 && password.length > 0) {
            spinner.removeClass('d-none');
            send_post('login', {
                'username': username,
                'password': password
            }).then((data) => {
                spinner.addClass('d-none');
                if (data.message === 'success') {
                    user_login_dialog_bs.hide();
                    cur_username = data.username;
                    render_user_specific();
                    render_userfav_class_item();
                    update_prompt_display_fav();
                } else {
                    error_message.removeClass('d-none');
                    setTimeout(() => {
                        error_message.addClass('d-none');
                    }, 5000);
                }
            })
        }
    }
}

function logout_click_listener() {
    get_data('logout').then(() => {
        cur_username = '';
        render_user_specific();
        render_userfav_class_item();
        update_prompt_display_fav();
    })
}

function user_setting_ok_click_listener() {
    var oldpass_group = $('#setting-oldpass-group');
    var newpass_group = $('#setting-newpass-group');
    var newpass_re_group = $('#setting-newpass-repeat-group');
    var error_message = $('#setting-error-message');
    error_message.addClass('d-none');
    var spinner = $('#user-setting-ok-btn .spinner-border');

    var oldpass = validate_input(oldpass_group);
    var newpass = validate_input(newpass_group, newpass_re_group);

    if (oldpass.length > 0 && newpass.length > 0) {
        spinner.removeClass('d-none');
        send_post('change_password', {
            'old_password': oldpass,
            'new_password': newpass
        }).then((data) => {
            spinner.addClass('d-none');
            if (data.message === 'success') {
                user_setting_dialog_bs.hide();
                $('#user-setting-dialog').find('input').val('');
            } else {
                error_message.removeClass('d-none');
                setTimeout(() => {
                    error_message.addClass('d-none');
                }, 5000);
            }
        })
    }
}