/**
 * Listeners and control functions. These functions define the behavior of elements on the page.
 */


function class_select_listener(selected_class_id, scroll) {
    if (cur_selected_class !== selected_class_id) {
        cur_selected_class = selected_class_id;
        set_cookie('selected_class', cur_selected_class, 30);
        switch_active_class(cur_selected_class, scroll);

        render_class_prompts(cur_selected_class);
        class_sidebar_bs.hide();
    }
}

function switch_active_class(selected_class_id, scroll) {
    if (selected_class_id === 'special-popular') {
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
        cur_selected_class = "special-popular";
    }

    if (cur_username === "" && cur_selected_class === "special-user_fav") {
        cur_selected_class = "special-popular"
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
    render_prompt_example_display(function_id, semantic_id, lan_code).finally(() => {
        btn.find('.spinner-border').addClass('d-none');
        btn.find('.bi').removeClass('d-none');
    });
}

function gain_popularity_listener(card, function_id, semantic_id, lan_code, increase) {
    var pop_display = card.find('.popularity-badge span')
    var cur_pop = parseInt(pop_display.text());
    pop_display.text(cur_pop + increase);
    masonry_reload(card.parents('#prompt-display'), '.prompt-col');
    send_post(`/increase_popularity`,
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
        render_search_prompts(search_text, cur_page_lan)
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
    var submit_ok_btn = $('#submit-enter-btn');
    if (func_desc.length > 0 & prompt_content.length > 0) {
        loading_state_btn(submit_ok_btn);
        send_post('/submit_function', {
            'func_desc': func_desc,
            'prompt_content': prompt_content,
            'user_name': user_name
        }).then(() => {
            finished_state_btn(submit_ok_btn);
            submit_dialog_bs.hide();
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
            send_post('/add_fav_prompt', prompt_indicator);
            gain_popularity_listener(prompt_card, function_id, semantic_id, lan_code, 2);
        } else {
            fav_icon.switchClass('bi-bookmark-check-fill', 'bi-bookmark');
            send_post('/remove_fav_prompt', prompt_indicator);
            gain_popularity_listener(prompt_card, function_id, semantic_id, lan_code, -2);
        }
    }
}

function not_implemented_listener() {
    show_warning_toast(warning_contents[cur_page_lan]['not_implemented']);
}

function register_click_listener() {
    var username_group = $('#login-username-group');
    var password_group = $('#login-password-group');
    var password_re_group = $('#login-password-repeat-group');
    var register_btn = $('#register-btn');

    if (password_re_group.hasClass('d-none')) {
        password_re_group.removeClass('d-none');
    } else {
        var username = validate_input(username_group);
        var password = validate_input(password_group, password_re_group);

        if (username.length > 0 && password.length > 0) {
            loading_state_btn(register_btn);
            send_post('/register', {
                'username': username,
                'password': password
            }).then((data) => {
                finished_state_btn(register_btn);
                if (data.message === 'success') {
                    user_login_dialog_bs.hide();
                    cur_username = data.username;
                    render_user_specific();
                    render_userfav_class_item();
                    action_sidebar_bs.hide();
                } else {
                    show_error_message($('#user-login-dialog'),
                        user_contents[cur_page_lan]['register_error_message']);
                }
            })
        }
    }
}

function login_click_listener() {
    var username_group = $('#login-username-group');
    var password_group = $('#login-password-group');
    var password_re_group = $('#login-password-repeat-group');
    var login_btn = $('#login-btn');

    if (!password_re_group.hasClass('d-none')) {
        $('#login-password-repeat-group').addClass('d-none');
    } else {
        var username = validate_input(username_group);
        var password = validate_input(password_group);

        if (username.length > 0 && password.length > 0) {
            loading_state_btn(login_btn);
            send_post('/login', {
                'username': username,
                'password': password
            }).then((data) => {
                finished_state_btn(login_btn);
                if (data.message === 'success') {
                    user_login_dialog_bs.hide();
                    cur_username = data.username;
                    if (cur_username === 'admin') {
                        location.reload();
                    }
                    render_user_specific();
                    render_userfav_class_item();
                    update_prompt_display_fav();
                    action_sidebar_bs.hide();
                } else {
                    show_error_message($('#user-login-dialog'),
                        user_contents[cur_page_lan]['login_error_message']);
                }
            })
        }
    }
}

function logout_click_listener() {
    get_data('/logout').then(() => {
        if (cur_username === 'admin') {
            location.reload();
        }

        cur_username = '';
        render_user_specific();
        render_userfav_class_item();
        update_prompt_display_fav();
        action_sidebar_bs.hide();
    })
}

function user_setting_ok_click_listener() {
    var oldpass_group = $('#setting-oldpass-group');
    var newpass_group = $('#setting-newpass-group');
    var newpass_re_group = $('#setting-newpass-repeat-group');
    var ok_btn = $('#user-setting-ok-btn');

    var oldpass = validate_input(oldpass_group);
    var newpass = validate_input(newpass_group, newpass_re_group);

    if (oldpass.length > 0 && newpass.length > 0) {
        loading_state_btn(ok_btn);
        send_post('/change_password', {
            'old_password': oldpass,
            'new_password': newpass
        }).then((data) => {
            finished_state_btn(ok_btn);
            if (data.message === 'success') {
                user_setting_dialog_bs.hide();
                $('#user-setting-dialog').find('input').val('');
            } else {
                show_error_message($('#user-setting-dialog'), user_contents[cur_page_lan]['setting_error_message'])
            }
        })
    }
}