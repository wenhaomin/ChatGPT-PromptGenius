/**
 * Renderers. These functions control how the element on the pages are rendered.
 * They also assign event listeners to elements if needed.
 */

async function init_language_select() {
    // Intialize the options in #language-select.
    var data = await get_data('fetch_lan');
    data.forEach(function (item) {
        var language_select_item = $(`
            <li lan-code="${item['code']}"><a class="dropdown-item">${item['name']}</a></li>
        `);

        $('#nav-language-select').append(language_select_item);
        switch_active_language(cur_lan_code);

        language_select_item.on('click', () => { language_select_listener(item['code']); });
    });
}

async function render_page_basic() {
    // Render the basic elements on the page.
    $('#page-browser-title, #page-header-title').text(site_contents[cur_lan_code]['title']);
    $('#class-offcanvas-title').text(site_contents[cur_lan_code]['class_canvas_title']);
    $('#action-offcanvas-title').text(site_contents[cur_lan_code]['action_canvas_title']);

    $('#navbar-links').empty();
    ['/', '/tools', '/log'].forEach((href, index) => {
        var nav_item = $(`
            <li class="nav-item me-3 me-lg-0">
                <a class="nav-link navbar-link
                    ${(href === window.location.pathname) ? 'active-navbar-link' : ''}" 
                    href="${href}">${navbar_contents[cur_lan_code][index]}</a>
            </li>
        `);
        $('#navbar-links').append(nav_item);
    })

    document.title += '-' + $('#navbar-links').find('.active-navbar-link').text();

    $('#search-input-group input').attr('placeholder', searchbar_contents[cur_lan_code]['placeholder']);
    $('#nav-submit-btn span').text(actionbar_contents[cur_lan_code]["submit_btn_text"]);

    var user_group = $('#user-group');
    var _user_contents = user_contents[cur_lan_code];
    var login_or_register_text = `${_user_contents["login_text"]} / ${_user_contents["register_text"]}`;
    user_group.find('.welcome-text').text(_user_contents["welcome_text"]);
    user_group.find('.user-name').text(_user_contents["guest_name"]);
    user_group.find('.login-btn span').text(login_or_register_text);
    user_group.find('.user-setting-btn span').text(_user_contents["user_setting_text"]);

    var user_login_dialog = $('#user-login-dialog');
    if (user_login_dialog.length) {
        user_login_dialog.find('.modal-title').text(login_or_register_text);
        user_login_dialog.find('.login-error-message').text(_user_contents["login_error_message"]);
        user_login_dialog.find('.register-error-message').text(_user_contents["register_error_message"]);
        $('#login-dialog-message').text(_user_contents["login_message"]);
        $('#login-username-group input').attr('placeholder', _user_contents["username_ph"]);
        $('#login-password-group input').attr('placeholder', _user_contents["password_ph"]);
        $('#login-password-repeat-group input').attr('placeholder', _user_contents["password_re_ph"]);
        $('#register-btn span').text(_user_contents["register_text"]);
        $('#login-btn span').text(_user_contents["login_text"]);
    }

    if ($('#submit-dialog').length) {
        // Render contents in submit dialog.
        $('#submit-dialog-title').text(submit_contents[cur_lan_code]['title']);
        $('#submit-dialog-message').text(submit_contents[cur_lan_code]['message']);
        $('#submit-dialog-funcdesc-group input').attr('placeholder', submit_contents[cur_lan_code]['func_placeholder']);
        $('#submit-dialog-prompt-group textarea').attr('placeholder', submit_contents[cur_lan_code]['prompt_placeholder']);
        $('#submit-dialog-user-group input').attr('placeholder', submit_contents[cur_lan_code]['username_placeholder']);
        $('#submit-enter-btn-text').text(submit_contents[cur_lan_code]['ok_btn_text']);
        $('#submit-clear-btn').text(submit_contents[cur_lan_code]['clear_btn_text']);
    }

    if ($('#top-banner').length) {
        $('#top-banner-inner').empty();
        $('#top-banner-indicator').empty();
        banner_contents[cur_lan_code].forEach(({ image, url }, index) => {
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
        $('#prompt-more-dialog').find('.modal-title').text(prompt_more_dialog_contents[cur_lan_code]['title']);
    }
}

async function render_class_tree() {
    // Intialize the options in #language-select.
    var data = await get_data(`fetch_classes/${cur_lan_code}`);
    $('#class-selection-list').empty();
    data.forEach((item, index) => {
        var class_selection = gen_class_selection(item);
        $('#class-selection-list').append(class_selection);
        if (item['childrens'] != undefined && item['childrens'].length) {
            $('#class-selection-list').append(gen_child_class_selection(item['childrens']));
        }
        if (index < data.length - 1) {
            $('#class-selection-list').append(`<hr class="class-selection-divider">`);
        }
    });

    $('.class-nav-link, .child-class-nav-link').on('click', (event) => {
        class_select_listener($(event.target).attr('class-id'));
    })

    switch_active_class(cur_selected_class, true);
}

async function render_tools() {
    var data = await get_data(`fetch_tools/${cur_lan_code}`);
    var display = $('#tools-display')
    display.empty();
    data.forEach(({ name, desc, url, icon_src, tags }) => {
        var card = gen_tool_card(name, desc, url, icon_src, tags);
        var col = $(`<div class="tool-col col">`).append(card);
        display.append(col);
    });

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

function render_prompt_display(prompt_list) {
    var display = $("#prompt-display");
    display.empty();
    prompt_list.forEach((item, index) => {
        var col = $(`<div class="prompt-col col">`);
        var card = gen_prompt_card(item);
        display.append(col.append(card));
    });

    display.find('.prompt-copy-btn span').text(prompt_card_contents[cur_lan_code]['copy_text']);
    display.find('.prompt-fav-btn span').text(prompt_card_contents[cur_lan_code]['fav_text']);
    display.find('.prompt-example-btn span').text(prompt_card_contents[cur_lan_code]['more_text']);
    display.find('.prompt-fav-btn').on('click', not_implemented_listener);

    if (prompt_list.length === 0) {
        $('#warning-toast').find('span').text(warning_contents[cur_lan_code]['no_prompt']);
        warning_toast.show();
    } else {
        warning_toast.hide();
    }

    masonry_reload(display, '.prompt-col');
}

// By Haomin Wen: display all prompts of a given class
async function render_prompt_by_class(class_id) {
    render_placeholder_prompt_display();
    var data = await get_data(`fetch_prompt/${class_id}/${cur_lan_code}`);
    // use a function to handle the response data
    // call another function to render the fetched prompt data
    render_prompt_display(data['content']);
}

// search prompt by give string
async function render_prompt_by_string(search_text) {
    render_placeholder_prompt_display();
    var data = await get_data(`search_prompt/${search_text}/${cur_lan_code}`);
    render_prompt_display(data['content']);
}

async function render_prompt_example_display(function_id, semantic_id, lan_code) {
    const icons = ['person-fill', 'gear-wide'];
    const colors = ['FFB300', '039BE5']
    const speakers = prompt_more_dialog_contents[cur_lan_code]['speakers'];

    var data = await get_data(`get_prompt_dialog/${function_id}/${semantic_id}/${lan_code}`);

    var prompt_more_dialog = $('#prompt-more-dialog');
    prompt_more_dialog.find('.modal-body').empty();
        var [nav, nav_tabs] = gen_multimodel_dialog_display(data['content']);
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
    var contents = await get_data(`fetch_logs/${cur_lan_code}`);

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