function gen_class_card_html(class_id, class_name, example_desc) {
    html = `
    <div class="mdui-col class-card-col">
        <div class="mdui-card class-card mdui-hoverable" id="class-card-${class_id}" classid="${class_id}">
            <div class="mdui-card-primary class-card-primary">
                <div class="mdui-card-primary-title">${class_name}</div>
            </div>
            <div class="mdui-card-content">${example_desc}</div>
        </div>
    </div>
    `
    return html
}

function gen_class_selection(item) {
    var nav_item = $(`
        <li class="nav-item h6 class-list-item">
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
    if (author === undefined || author.length === 0) {
        author = 'Anonymous'
    }

    if (author_link === undefined || author_link === null || author_link.length === 0 || author_link === '-') {
        author_link = '';
    } else {
        author_link = `href="${author_link}"`;
    }

    var card = $(`
        <div class="card shadow-sm" style="background-color: #${icon_color}1a">
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
                </div>
                <div class="card-text small prompt-card-content">
                    ${prompt_html}
                </div>
                <div class="row prompt-card-action-row g-1">
                    <div class="col-4"><button class="btn badge text-dark w-100 prompt-copy-btn">
                        <span>${copied_count}</span>
                        <i class="bi bi-clipboard"></i>
                    </button></div>
                    <div class="col-4"><button class="btn badge text-dark w-100 prompt-fav-btn">
                        <i class="bi bi-bookmark"></i>
                        <span></span>
                    </button></div>
                    <div class="col-4"><button class="btn badge text-dark w-100 prompt-example-btn 
                    ${dialog_count > 0 ? '' : 'border-0 disabled'}">
                        <div class="spinner-border d-none prompt-example-btn-spinner"></div>
                        <i class="bi bi-chat-text"></i>
                        <span></span>
                    </button></div>
                </div>
            </div>
        </div>
    `);
    const tooltip = new bootstrap.Tooltip(card.find('.function-desc-badge'));

    var example_btn = card.find('.prompt-example-btn');
    card.find('.prompt-fav-btn').on('click', not_implemented_listener);
    example_btn.on('click', () => {
        example_btn.find('.spinner-border').removeClass('d-none');
        example_btn.find('.bi').addClass('d-none');
        render_prompt_example_display(function_id, semantic_id, cur_lan_code).then(() => {
            example_btn.find('.spinner-border').addClass('d-none');
            example_btn.find('.bi').removeClass('d-none');
        });
    });

    var copy_btn = card.find('.prompt-copy-btn');
    copy_btn.on('click', () => {
        copy_to_clipboard(prompt_text.trim());
        copy_btn.find('.bi').switchClass('bi-clipboard', 'bi-clipboard-check-fill');

        item['copied_count'] += 1
        add_search_prompt(cur_lan_code, function_id, semantic_id);
        copy_btn.find('span').text(item['copied_count']);

        setTimeout(() => {
            copy_btn.find('.bi').switchClass('bi-clipboard-check-fill', 'bi-clipboard');
        }, 2000);
    })

    return card;
}

function masonry_reload(parent_dom, item_selector) {
    parent_dom.masonry({
        itemSelector: item_selector,
        columnWidth: item_selector,
        percentPosition: true
    }).masonry('reloadItems').masonry('layout');
}

function gen_prompt_display(prompt_list) {
    var display = $("#prompt-display");
    display.text('');
    prompt_list.forEach((item, index) => {
        var col = $(`<div class="prompt-col col">`);
        var card = gen_prompt_card(item);
        display.append(col.append(card));
    });

    $('.prompt-fav-btn span').text(prompt_card_contents[cur_lan_code]['fav_text']);
    $('.prompt-example-btn span').text(prompt_card_contents[cur_lan_code]['more_text']);

    if (prompt_list.length === 0) {
        $('#warning-toast').find('span').text(warning_contents[cur_lan_code]['no_prompt']);
        warning_toast.show();
    } else {
        warning_toast.hide();
    }

    masonry_reload(display, '.prompt-col');
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
    const icons = ['person-fill', 'gear-wide'];
    const colors = ['FFB300', '039BE5']
    const speakers = prompt_more_dialog_contents[cur_lan_code]['speakers'];
    dialog_contents.forEach((content, index) => {
        const i = content.role ? content.role : (index % 2);
        var dialog_item = $(`
            <li class="list-group-item d-flex flex-column" 
            style="background-color: #${colors[i]}2a">
                <div class="d-flex flex-row justify-content-between mb-1">
                    <span class="badge d-flex align-items-center" style="background-color: #${colors[i]} !important">
                        <i class="bi bi-${icons[i]} me-1"></i>
                        ${speakers[i]}
                    </span>
                    <button class="btn badge border-0 text-dark dialog-copy-btn">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <small>${content.html}</small>
            </li>
        `);
        var copy_btn = dialog_item.find('.dialog-copy-btn');
        copy_btn.on('click', () => {
            copy_to_clipboard(content.raw);
            copy_btn.find('.bi').switchClass('bi-clipboard', 'bi-clipboard-check-fill');
            setTimeout(() => {
                copy_btn.find('.bi').switchClass('bi-clipboard-check-fill', 'bi-clipboard');
            }, 2000);
        });

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