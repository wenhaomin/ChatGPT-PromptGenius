/**
 * Renderers. These functions control how the element on the pages are rendered.
 * They also assign event listeners to elements if needed.
 */

async function render_page_settings() {
    // Intialize the options in #language-select.
    var data = await ajax_request('/fetch_lan', 'GET');
    data.forEach((item) => {
        var language_ratio = $(`
            <input type="radio" class="btn-check page-lan-radio" name="language-ratio" id="language-radio-${item['code']}"
            ${item['code'] === cur_page_lan ? 'checked' : ''} lan-code="${item['code']}">
            <label class="btn btn-outline-info" for="language-radio-${item['code']}">${item['name']}</label>
        `);
        $('#page-setting-dialog #basic-element-ratio-group').append(language_ratio);

        var language_check = $(`
            <input type="checkbox" class="btn-check prompt-lan-check" id="language-check-${item['code']}" autocomplete="off"
            ${cur_prompt_lans.includes(item['code']) ? 'checked': ''} lan-code="${item['code']}">
            <label class="btn btn-outline-info" for="language-check-${item['code']}">${item['name']}</label>
        `);
        $('#page-setting-dialog #prompt-ratio-group').append(language_check);
    });

    if ($('#prompt-edit-dialog').length > 0) {
        data.forEach((item) => {
            $('#prompt-edit-dialog').find('select[content="lan-code"]').append(`
                <option value="${item['code']}">${item['name']}</option>
            `);
        })
    }
}

async function render_page_basic() {
    // Render the basic elements on the page.
    var _site_contents = site_contents[cur_page_lan];
    $('#page-browser-title, #page-header-title').text(_site_contents['title']);
    $('#class-offcanvas-title').text(_site_contents['class_canvas_title']);
    $('#action-offcanvas-title').text(_site_contents['action_canvas_title']);
    $('.ok-btn-text').text(_site_contents["ok_text"]);

    $('#navbar-links').empty();
    ['/', '/tools', '/log'].forEach((href, index) => {
        var nav_item = $(`
            <li class="nav-item">
                <a class="nav-link navbar-link
                    ${(href === window.location.pathname) ? 'active-navbar-link' : ''}" 
                    href="${href}">${navbar_contents[cur_page_lan][index]}</a>
            </li>
        `);
        $('#navbar-links').append(nav_item);
    });
    if (typeof gen_dashboard_navlink !== 'undefined') {
        $('#navbar-links').append(gen_dashboard_navlink());
    }

    document.title += '-' + $('#navbar-links').find('.active-navbar-link').text();

    $('#search-input-group input').attr('placeholder', searchbar_contents[cur_page_lan]['placeholder']);
    $('#nav-submit-btn span').text(actionbar_contents[cur_page_lan]["submit_btn_text"]);

    var _page_setting_contents = page_setting_contents[cur_page_lan];
    $('#page-setting-dialog .modal-title').text(_page_setting_contents['dialog_title']);
    $('#page-setting-dialog #basic-element-setting-text').text(_page_setting_contents['basic_element_title']);
    $('#page-setting-dialog #basic-element-setting-discription').text(_page_setting_contents['basic_element_discription']);
    $('#page-setting-dialog #prompt-setting-text').text(_page_setting_contents['prompt_title']);
    $('#page-setting-dialog #prompt-setting-discription').text(_page_setting_contents['prompt_discription']);

    var user_group = $('#user-group');
    var _user_contents = user_contents[cur_page_lan];
    var login_or_register_text = `${_user_contents["login_text"]} / ${_user_contents["register_text"]}`;
    user_group.find('.welcome-text').text(_user_contents["welcome_text"]);
    user_group.find('#login-item span').text(login_or_register_text);
    user_group.find('#logout-item span').text(_user_contents["logout_text"]);
    user_group.find('#user-setting-item span').text(_user_contents["user_setting_text"]);

    var user_login_dialog = $('#user-login-dialog');
    if (user_login_dialog.length) {
        user_login_dialog.find('.modal-title').text(login_or_register_text);
        $('#login-dialog-message').text(_user_contents["login_message"]);
        $('#login-username-group input').attr('placeholder', _user_contents["username_ph"]);
        $('#login-password-group input').attr('placeholder', _user_contents["password_ph"]);
        $('#login-password-repeat-group input').attr('placeholder', _user_contents["password_re_ph"]);
        $('#register-btn .btn-text').text(_user_contents["register_text"]);
        $('#login-btn .btn-text').text(_user_contents["login_text"]);
    }

    var user_setting_dialog = $('#user-setting-dialog');
    if (user_setting_dialog.length) {
        user_setting_dialog.find('.modal-title').text(_user_contents["user_setting_text"]);
        $('#setting-oldpass-group input').attr('placeholder', _user_contents["oldpass_ph"]);
        $('#setting-newpass-group input').attr('placeholder', _user_contents["newpass_ph"]);
        $('#setting-newpass-repeat-group input').attr('placeholder', _user_contents["newpass_re_ph"]);
    }

    if ($('#submit-dialog').length) {
        // Render contents in submit dialog.
        var _submit_contents = submit_contents[cur_page_lan];
        $('#submit-dialog-title').text(_submit_contents['title']);
        $('#submit-dialog-message').text(_submit_contents['message']);
        $('#submit-dialog-funcdesc-group input').attr('placeholder', _submit_contents['func_placeholder']);
        $('#submit-dialog-prompt-group textarea').attr('placeholder', _submit_contents['prompt_placeholder']);
        $('#submit-dialog-user-group input').attr('placeholder', _submit_contents['username_placeholder']);
        $('#submit-dialog').find('.btn-text').text(_submit_contents['ok_btn_text']);
        $('#submit-clear-btn').text(_submit_contents['clear_btn_text']);
    }

    if ($('#top-banner').length) {
        $('#top-banner-inner').empty();
        $('#top-banner-indicator').empty();
        banner_contents[cur_page_lan].forEach(({ image, url }, index) => {
            var banner_item = gen_top_banner_item(image, url);
            var indicator_item = $(`<button type="button" data-bs-target="#top-banner" data-bs-slide-to="${index}"></button>`);
            if (index === 0) {
                banner_item.addClass('active');
                indicator_item.addClass('active');
            }
            $('#top-banner-inner').append(banner_item);
            $('#top-banner-indicator').append(indicator_item);
        })
    }

    if ($('#prompt-more-dialog').length) {
        $('#prompt-more-dialog').find('.modal-title').text(prompt_more_dialog_contents[cur_page_lan]['title']);
    }
}

async function render_class_tree() {
    // Intialize the options in #language-select.
    var data = await ajax_request(`/fetch_classes/${cur_page_lan}`, 'GET', null, 'classes');
    if (data === undefined) {
        return;
    }
    special_class_contents.slice().reverse().forEach((item) => {
        data.unshift({
            'ID': item.ID,
            'name': item.names[cur_page_lan],
            'icon': item.icon,
            'icon_style': item.icon_style
        })
    })

    $('#class-selection-list').empty();
    data.forEach((item, index) => {
        var class_selection = gen_class_selection(item);
        var parent_class_container = $(`<div class="parent-class-container rounded">`);
        parent_class_container.append(class_selection);
        if (item['childrens'] !== undefined && item['childrens'].length) {
            parent_class_container.append(gen_child_class_selection(item['childrens']));
        }
        $('#class-selection-list').append(parent_class_container);
        if (index < data.length - 1) {
            $('#class-selection-list').append(`<hr class="class-selection-divider">`);
        }
    });

    await render_userfav_class_item();

    $('.class-nav-link, .child-class-nav-link').on('click', (event) => {
        class_select_listener($(event.target).attr('class-id'));
    })

    switch_active_class(cur_selected_class, true);
}

async function render_tools() {
    var data = await ajax_request(`/fetch_tools/${cur_page_lan}`, 'GET', null, 'tools');
    var display = $('#tools-display')
    display.empty();
    data.forEach(({ name, desc, url, icon_src, tags, lan_code }) => {
        var card = gen_tool_card(name, desc, url, icon_src, tags, lan_code);
        var col = $(`<div class="tool-col col">`).append(card);
        display.append(col);
    });

    if (typeof gen_tool_card_edit_btn !== 'undefined') {
        display.prepend(gen_add_tool_card());
        display.find('.tool-card').append(gen_tool_card_edit_btn());
    }

    masonry_reload(display, '.tool-col');
}

function render_placeholder_prompt_display() {
    var display = $("#prompt-display");
    display.empty();
    ['4350af', '613cb0', 'd0dc59', '97c15c', 'ec6337', 'f6c344'].forEach((color, index) => {
        var col = $(`<div class="prompt-col col">`);
        var card = gen_placeholder_card(color, index + 4);
        display.append(col.append(card));
    })
    masonry_reload(display, '.prompt-col');
}

async function render_prompt_display(data_url) {
    var display = $("#prompt-display");
    display.empty();
    ['4350af', '613cb0', 'd0dc59', '97c15c', 'ec6337', 'f6c344'].forEach((color, index) => {
        var col = $(`<div class="prompt-col col">`);
        var card = gen_placeholder_card(color, index + 4);
        display.append(col.append(card));
    })
    masonry_reload(display, '.prompt-col');

    var data = await ajax_request(data_url, 'GET', null, 'prompt');
    if (data === undefined) {
        return;
    }

    display.empty();
    var prompt_list = data.content;
    prompt_list.forEach((item, index) => {
        var col = $(`<div class="prompt-col col">`);
        var card = gen_prompt_card(item);
        display.append(col.append(card));
    });

    display.find('.prompt-copy-btn span').text(prompt_card_contents[cur_page_lan]['copy_text']);
    display.find('.prompt-fav-btn span').text(prompt_card_contents[cur_page_lan]['fav_text']);
    display.find('.prompt-example-btn span').text(prompt_card_contents[cur_page_lan]['more_text']);

    if (prompt_list.length === 0) {
        show_warning_toast(warning_contents[cur_page_lan]['no_prompt']);
    } else {
        warning_toast.hide();
    }

    if (typeof gen_prompt_card_edit_btn !== 'undefined') {
        display.prepend(gen_add_prompt_card());
        display.prepend(gen_edit_function_card());
        display.find('.prompt-card').append(gen_prompt_card_edit_btn());
    }

    masonry_reload(display, '.prompt-col');
    masonry_reload_on_images(display, '.prompt-col');

    await update_prompt_display_fav();
}

async function render_class_prompts(class_id) {
    await render_prompt_display(`/fetch_prompt/${class_id}/${cur_prompt_lans}`);
}

async function render_search_prompts(search_text) {
    await render_prompt_display(`/search_prompt/${search_text}/${cur_prompt_lans}`);
}

async function render_prompt_example_display(function_id, semantic_id, lan_code) {
    const icons = ['person-fill', 'gear-wide'];
    const colors = ['FFB300', '039BE5']
    const speakers = prompt_more_dialog_contents[cur_page_lan]['speakers'];

    var data = await send_post(`get_prompt_dialog`, {
        'function_id': function_id,
        'semantic_id': semantic_id,
        'lan_code': lan_code
    });

    var prompt_more_dialog = $('#prompt-more-dialog');
    prompt_more_dialog.find('.modal-body').empty();
    var [nav, nav_tabs] = gen_multimodel_dialog_display(data['content'], data['model_order']);
    nav_tabs.find('td, th').addClass('border border-dark');
    prompt_more_dialog.find('.modal-body').append(nav).append(nav_tabs);

    for (var role = 0; role < 2; role++) {
        var dialog_role_lists = prompt_more_dialog.find(`.dialog-list-item[role='${role}']`);
        dialog_role_lists.css('background-color', `#${colors[role]}2a`);
        var dialog_role_badges = dialog_role_lists.find('.dialog-role-badge');
        dialog_role_badges.css('background-color', `#${colors[role]}`);
        dialog_role_badges.find('.bi').addClass(`bi-${icons[role]}`);
        dialog_role_badges.find('span').text(speakers[role]);
    }

    prompt_more_dialog_bs.show();
}

async function render_logs_display() {
    var contents = await ajax_request(`/fetch_logs/${cur_page_lan}`, 'GET', null, 'logs');

    var displays = $('#top-log-display, #logs-display');
    displays.empty();

    $('#top-log-display').append($(`<div class="col log-col">`).append(
        gen_log_card(contents.content[0], '#FDD835')));

    var display = $('#logs-display');
    contents.content.slice(1).reverse().forEach((item, index) => {
        var col = $(`<div class="col log-col">`);
        display.append(col.append(gen_log_card(item,
            value_to_hex(index, logindex_minmax[0], logindex_minmax[1], logindex_cmap))));
    });

    displays.find('h2').addClass('h4');
    displays.find('h3').addClass('h5');
    displays.find('h4').addClass('h6');
    displays.find('a').addClass('link-dark link-underline-opacity-50 link-underline-opacity-100-hover');
    displays.find('a').attr('target', '_blank');

    masonry_reload(display, '.log-col');
}

async function render_user_specific() {
    var userbar_icon = $('#user-group .dropdown-toggle .bi');
    var username_span = $('#user-group').find('.user-name');
    var login_item = $('#user-group').find('#login-item');
    var setting_item = $('#user-group').find('#user-setting-item');
    var logout_item = $('#user-group').find('#logout-item');

    if (cur_username.length > 0) {
        userbar_icon.removeClass('bi-person-fill');
        userbar_icon.text(cur_username);
        username_span.text(cur_username);

        login_item.addClass('d-none');
        setting_item.removeClass('d-none');
        logout_item.removeClass('d-none');
    } else {
        userbar_icon.addClass('bi-person-fill');
        userbar_icon.empty();
        username_span.text(user_contents[cur_page_lan]['guest_name']);

        login_item.removeClass('d-none');
        setting_item.addClass('d-none');
        logout_item.addClass('d-none');
    }

    $('#submit-dialog-user-group input').val(cur_username);
}

async function render_userfav_class_item() {
    var fav_class_item = $('#class-selection-list').find(`.class-nav-link[class-id="special-user_fav"]`).parent();
    var fav_class_div = $('#class-selection-list').find('.class-selection-divider').first();
    if (cur_username.length > 0) {
        fav_class_item.removeClass('d-none');
        fav_class_div.removeClass('d-none');
    } else {
        fav_class_item.addClass('d-none');
        fav_class_div.addClass('d-none');
        if (cur_selected_class == 'special-user_fav') {
            cur_selected_class = 'special-popular';
            set_cookie('selected_class', cur_selected_class, 30);
            switch_active_class(cur_selected_class);
            render_class_prompts(cur_selected_class);
        }
    }
}

async function update_prompt_display_fav() {
    if (cur_username.length > 0) {
        var fav_prompts = await ajax_request('/fetch_fav_prompt', 'GET');
        if (fav_prompts === undefined) {
            return;
        }
        fav_prompts['content'].forEach((item) => {
            var prompt_card = $(`.prompt-card[function-id="${item.function_id}"][semantic-id="${item.semantic_id}"][lan-code="${item.lan_code}"]`);
            if (prompt_card.length) {
                prompt_card.find('.prompt-fav-btn .bi').switchClass('bi-bookmark', 'bi-bookmark-check-fill');
            }
        })
    } else {
        $('.prompt-card').find('.prompt-fav-btn .bi').switchClass('bi-bookmark-check-fill', 'bi-bookmark');
    }
}