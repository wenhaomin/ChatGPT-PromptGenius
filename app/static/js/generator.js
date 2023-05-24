/**
 * Generators. These functions are fed with raw contents, and they control the HTML arrangement of corresponding content display.
 */

function gen_class_selection(item) {
    var nav_item = $(`
        <li class="nav-item h6 class-list-item" color-hex=${item['icon_style']}>
            <a class="nav-link link-body-emphasis text-truncate d-inline-block class-nav-link" 
                class-id="${item['ID']}">
                <i class="bi bi-${item['icon']} class-icon" style="color: #${item['icon_style']}"></i>
                ${item['name']}
            </a>
        </li>
    `);
    return nav_item;
}

function gen_child_class_selection(childrens) {
    var child_list = $(`<ul class="nav nav-pills flex-column child-class-list">`);
    childrens.forEach(({ ID, name }) => {
        child_list.append($(`
            <li class="nav-item small child-class-list-item">
                <a class="nav-link link-body-emphasis text-truncate d-inline-block child-class-nav-link" 
                class-id="${ID}">
                    ${name}
                </a>
            </li>
        `));
    });
    return child_list;
}

function gen_placeholder_card(color, num_lines) {
    var card = $(`
        <div class="card shadow-sm" style="background-color: #${color}1a">
            <div class="card-body">
                <div class="card-title mb-1">
                    <div class="badge rounded-pill placeholder col-4" 
                    style="background-color: #${color}; height: 23px">
                    </div>
                    <div class="badge rounded-pill text-bg-info placeholder col-3" style="height: 23px">
                    </div>
                </div>
                <div class="card-text small placeholder-glow"></div>
            </div>
        <div>
    `);
    for (var i = 0; i < num_lines; i++) {
        card.find('.card-text').append(`
            <span class="placeholder col-${random_int(2, 6)}"></span>
        `)
    }

    return card;
}

function gen_prompt_card(item) {
    var function_name = item['function_name']
    var prompt_html = item['html']
    var prompt_text = item['content']
    var author = item['author']
    var author_link = item['author_link']
    var icon = item['icon']
    var icon_color = item['icon_style']
    var copied_count = item['copied_count']
    var dialog_count = item['dialog_count']
    var function_id = item['functionID'];
    var semantic_id = item['semanticID'];
    var lan_code = item['lanCode'];
    var priority = item['priority'];
    if (author === undefined || author.length === 0) {
        author = 'Anonymous'
    }

    if (author_link === undefined || author_link === null || author_link.length === 0 || author_link === '-') {
        author_link = '';
    } else {
        author_link = `href="${author_link}"`;
    }

    if (priority < 0) {
        icon_color = '212121';
    }

    var pop_color = value_to_hex(copied_count, pop_minmax[0], pop_minmax[1], pop_cmap);
    var card = $(`
        <div class="card shadow-sm prompt-card" style="background-color: #${icon_color}20"
        function-id="${function_id}" semantic-id="${semantic_id}" lan-code="${lan_code}">
            <div class="card-body">
                <div class="card-title d-flex justify-content-between mb-0">
                    <div class="prompt-tag-row d-flex flex-wrap">
                        <a class="btn badge rounded-pill function-desc-badge text-light text-truncate mb-1 me-1" 
                        style="background-color: #${icon_color}" 
                        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="${function_name}">
                            <i class="bi bi-${icon}"></i>
                            <span class="function-desc-badge-text">${function_name}</span>
                        </a>
                        <a ${author_link} target="_blank" class="badge btn rounded-pill text-bg-info mb-1">${author}</a>
                    </div>
                    <div class="badge popularity-badge" style="color: ${pop_color}">
                        <span>${copied_count}</span>
                        <i class="bi bi-fire"></i>
                    </div>
                </div>
                <div class="card-text small prompt-card-content">
                    ${prompt_html}
                </div>
                <div class="row prompt-card-action-row g-1">
                    <div class="col-4"><button class="btn badge text-dark w-100 prompt-copy-btn px-0">
                        <i class="bi bi-clipboard"></i>
                        <span></span>
                    </button></div>
                    <div class="col-4"><button class="btn badge text-dark w-100 prompt-fav-btn px-0">
                        <i class="bi bi-bookmark"></i>
                        <span></span>
                    </button></div>
                    <div class="col-4"><button class="btn badge text-dark w-100 prompt-example-btn px-0
                    ${dialog_count > 0 ? '' : 'border-0 disabled'}">
                        <div class="spinner-border d-none prompt-example-btn-spinner"></div>
                        <i class="bi bi-chat-text"></i>
                        <span></span>
                    </button></div>
                </div>
            </div>
        </div>
    `);
    new bootstrap.Tooltip(card.find('.function-desc-badge'));

    var example_btn = card.find('.prompt-example-btn');
    example_btn.on('click', () => {
        example_btn_click_listener(example_btn, function_id, semantic_id, lan_code);
        gain_popularity_listener(card, function_id, semantic_id, lan_code, 1);
    });

    var fav_btn = card.find('.prompt-fav-btn');
    fav_btn.on('click', () => {
        prompt_fav_listener(fav_btn, function_id, semantic_id, lan_code);
    })

    var copy_btn = card.find('.prompt-copy-btn');
    copy_btn.on('click', () => {
        copy_btn_click_listener(copy_btn, prompt_text);
        gain_popularity_listener(card, function_id, semantic_id, lan_code, 1);
    })

    return card;
}

function gen_top_banner_item(image, url) {
    return $(`
        <div class="carousel-item rounded top-banner-item py-1 py-md-2 px-0">
            <img class="d-block object-fit-scale w-100 banner-img" src="${image}"></img>
        </div>
    `)
}

function gen_tool_card(name, desc, url, icon, tags) {
    var card = $(`
        <a href="${url}" target="_blank" class="card shadow-sm text-decoration-none tool-card bg-light">
            <div class="card-body">
                <div class="card-title d-flex flex-column">
                    <div class="d-flex flex-nowrap justify-content-between">
                        <h5 class="ms-2">${name}</h5>
                        <img src="${icon}" class="object-fit-cover rounded tool-icon"></img>
                    </div>
                    <div class="tool-tag-row"></div>
                </div>
                <div class="card-text small">
                    ${desc}
                </div>
            </div>
        </a>
    `);

    tags.forEach(tag => {
        card.find('.tool-tag-row').append(`
            <span class="badge rounded-pill text-bg-info">${tag}</span>
        `);
    });

    return card;
}

function gen_dialog_list(dialog_contents) {
    var dialog_list = $(`<ul class="list-group list-group-flush rounded">`);
    dialog_contents.forEach((content, index) => {
        var role = (content.role === null || content.role === undefined) ? (index % 2) : content.role;
        var dialog_item = $(`
            <li class="list-group-item d-flex flex-column dialog-list-item" role="${role}">
                <div class="d-flex flex-row justify-content-between mb-1">
                    <span class="badge d-flex align-items-center dialog-role-badge">
                        <i class="bi me-1"></i>
                        <span></span>
                    </span>
                    <button class="btn badge border-0 text-dark dialog-copy-btn">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <small>${content.html}</small>
            </li>
        `);
        var copy_btn = dialog_item.find('.dialog-copy-btn');
        copy_btn.on('click', () => { copy_btn_click_listener(copy_btn, content.raw); });

        dialog_item.find('.codehilite').addClass('p-2 rounded')
        dialog_list.append(dialog_item);
    });
    return dialog_list;
}

function gen_multimodel_dialog_display(model_dialogs) {
    var model_nav = $(`<ul class="nav nav-underline mb-2">`);
    var nav_tabs = $(`<div class="tab-content">`);
    Object.entries(model_dialogs).forEach(([model_name, dialog_contents], index) => {
        model_nav.append(`
            <li class="nav-item">
                <button class="nav-link ${(index === 0) ? 'active' : ''}"
                    data-bs-toggle="tab" data-bs-target="#dialog-model-${index}">
                    ${model_name}
                </button>
            </li>
        `);

        var tab_content = $(`
            <div class="tab-pane fade ${(index === 0) ? 'active show' : ''}" 
                tabindex="0" id="dialog-model-${index}">
        `);
        tab_content.append(gen_dialog_list(dialog_contents));
        nav_tabs.append(tab_content);
    })
    return [model_nav, nav_tabs]
}

function gen_log_card(content, bg_color) {
    var card = $(`
        <div class="card shadow-sm" style="background-color: ${bg_color}1a">
            <div class="card-body small pt-1 pb-2">
                ${content}
            </div>
        </div>
    `);
    return card;
}