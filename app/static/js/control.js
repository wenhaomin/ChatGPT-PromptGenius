/**
 * Author: Yan Lin, Haomin Wen
 * Created on: 2023-03-18
 * Control functions.
 */

// const { CONNREFUSED } = require("dns");


function hex_to_rgb(hex) {
    // If it is a shorthand 3 digit hex color, convert to full 6 digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);

    return [r, g, b];
}

function set_cookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function get_cookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

async function get_data(url) {
    try {
        const response = await $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json'
        });
        return response;
    } catch (error) {
        console.error(error);
    }
}

async function send_post(url, data) {
    try {
        const response = await $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
        return response;
    } catch (error) {
        console.error(error);
    }
}

async function init_language_select() {
    // Load saved language code from cookie.
    var save_lan_code = get_cookie('lancode');
    if (save_lan_code != "") {
        cur_lan_code = save_lan_code;
    }
    // Intialize the options in #language-select.
    var data = await get_data('fetch_lan');
    data.forEach(function (item) {
        var language_select_item = $(`
            <li lan-code="${item['code']}"><a class="dropdown-item">${item['name']}</a></li>
        `);

        $('#nav-language-select').append(language_select_item);
        switch_active_language(cur_lan_code);

        language_select_item.on('click', () => {
            var selected_lan_code = item['code'];
            if (cur_lan_code !== selected_lan_code) {
                cur_lan_code = selected_lan_code;

                switch_active_language(selected_lan_code);
                set_cookie('lancode', cur_lan_code, 30);
                switch_language_listener(selected_lan_code);
                action_sidebar_bs.hide();
            }
        });
    });
}

async function render_page_basic(selected_lan_code) {
    // Render the basic elements on the page.
    var data;

    $('#page-browser-title, #page-header-title').text(site_contents[selected_lan_code]['title']);
    $('#class-offcanvas-title').text(site_contents[selected_lan_code]['class_canvas_title']);
    $('#action-offcanvas-title').text(site_contents[selected_lan_code]['action_canvas_title']);

    $('#navbar-links').empty();
    ['/', '/tools'].forEach((href, index) => {
        $('#navbar-links').append(`
            <li class="nav-item me-3 me-lg-0">
                <a class="nav-link navbar-link
                    ${(href === window.location.pathname) ? 'active-navbar-link' : ''}" 
                    href="${href}">${navbar_contents[cur_lan_code][index]}</a>
            </li>
        `)
    })

    if ($('#submit-dialog').length) {
        // Render contents in submit dialog.
        $('#submit-dialog-title').text(submit_contents[selected_lan_code]['title']);
        $('#submit-dialog-message').text(submit_contents[selected_lan_code]['message']);
        $('#submit-dialog-funcdesc-group input').attr('placeholder', submit_contents[selected_lan_code]['func_placeholder']);
        $('#submit-dialog-prompt-group textarea').attr('placeholder', submit_contents[selected_lan_code]['prompt_placeholder']);
        $('#submit-dialog-user-group input').attr('placeholder', submit_contents[selected_lan_code]['username_placeholder']);
        $('#submit-enter-btn-text').text(submit_contents[selected_lan_code]['ok_btn_text']);
        $('#submit-clear-btn').text(submit_contents[selected_lan_code]['clear_btn_text']);
    }

    if ($('#search-input-group').length) {
        $('#search-input-group input').attr('placeholder', searchbar_contents[selected_lan_code]['placeholder']);
        $('#search-input-group button').text(searchbar_contents[selected_lan_code]['btn_text']);
    }

    if ($('#top-banner').length) {
        $('#top-banner-inner').empty();
        $('#top-banner-indicator').empty();
        banner_contents[selected_lan_code].forEach(({ image, url }, index) => {
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
}

async function render_class_tree(selected_lan_code) {
    var saved_selected_class = get_cookie('selected_class');
    if (saved_selected_class !== "") {
        cur_selected_class = saved_selected_class;
    }

    // Intialize the options in #language-select.
    var data = await get_data(`fetch_classes/${selected_lan_code}`);
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
        var clicked_class = $(event.target).attr('class-id');
        if (cur_selected_class !== clicked_class) {
            cur_selected_class = clicked_class;
            switch_active_class(cur_selected_class);

            render_search_prompt_by_class(cur_selected_class, cur_lan_code);
            class_sidebar_bs.hide();

            set_cookie('selected_class', cur_selected_class, 30);
        }
    })

    switch_active_class(cur_selected_class, true);
}

async function render_tools(selected_lan_code) {
    var data = await get_data(`fetch_tools/${selected_lan_code}`);
    var display = $('#tools-display')
    display.empty();
    data.forEach(({ name, desc, url, icon_src, tags }) => {
        var card = gen_tool_card(name, desc, url, icon_src, tags);
        var col = $(`<div class="tool-col col">`).append(card);
        display.append(col);
    });

    masonry_reload(display, '.tool-col');
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

// By Haomin Wen: display all prompts of a given class
async function render_search_prompt_by_class(class_id, selected_lan_code) {
    var data = await get_data(`fetch_prompt/${class_id}/${selected_lan_code}`)
    // use a function to handle the response data
    // call another function to render the fetched prompt data
    gen_prompt_display(data['content']);
}

// search prompt by give string
async function render_search_prompt_by_string(search_text, selected_lan_code) {
    var data = await get_data(`search_prompt/${search_text}/${selected_lan_code}`)
    gen_prompt_display(data['content']);
}

async function render_prompt_example_display(function_id, semantic_id, lan_code) {
    var data = await get_data(`get_prompt_dialog/${function_id}/${semantic_id}/${lan_code}`);
    $('#prompt-more-dialog').find('.modal-body').empty();
    $('#prompt-more-dialog').find('.modal-title').text(prompt_more_dialog_contents[lan_code]['title']);
    if (data['count'] > 0) {
        var [nav, nav_tabs] = gen_multimodel_dialog_display(data['content']);
        $('#prompt-more-dialog').find('.modal-body').append(nav).append(nav_tabs);
        prompt_more_dialog_bs.show();
    }
}

// copy text
function copy_to_clipboard(text) {
    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            mdui.snackbar('Failed to copy.');
            console.log(err);
        }
    }
    copyContent();
}

// click copy add
function add_search_prompt(lanCode, functionID, semanticID) {
    send_post(`increase_count`, {
        'lan_code': lanCode,
        'function_id': functionID,
        'semantic_id': semanticID
    });
}