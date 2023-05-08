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
    var chat_list = item['chat_list']
    var class_list = item['class_list']
    var author = item['author']
    var author_link = item['author_link']
    var model = item['model']
    var function_desc = item['function_desc']
    var prompt_text = chat_list[0]
    var class_name = class_list[0]
    var icon_name = item['icon_name']
    var icon_style = item['icon_style']
    var copied_count = item['copied_count']
    if (author === undefined || author.length === 0) {
        author = 'Anonymous'
    }

    if (author_link === undefined || author_link === null || author_link.length === 0 || author_link === '-') {
        author_link = '';
    } else {
        author_link = `href="${author_link}"`;
    }

    var card = $(`
        <div class="card shadow-sm" style="background-color: #${icon_style}1a">
            <div class="card-body">
                <div class="card-title d-flex justify-content-between">
                    <div class="prompt-tag-row">
                        <a class="btn badge rounded-pill" style="background-color: #${icon_style}">
                            <i class="bi bi-${icon_name}"></i>
                            ${function_desc}
                        </a>
                        <a ${author_link} target="_blank" class="badge btn rounded-pill text-bg-info">${author}</a>
                    </div>
                    <div class="btn-group ms-2" style="height: 25px">
                        <a class="btn badge border-0 text-dark prompt-copy-btn">
                            <span class="copied-count-display">${copied_count}</span>
                            <i class="bi bi-clipboard"></i>
                        </a>
                    </div>
                </div>
                <div class="card-text small">
                    ${prompt_text}
                </div>
            </div>
        </div>
    `)
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

        var copy_btn = card.find('.prompt-copy-btn');
        copy_btn.on('click', () => {
            copy_to_clipboard(card.find('.card-text').text().trim());
            copy_btn.find('.bi').switchClass('bi-clipboard', 'bi-clipboard-check-fill');

            item['copied_count'] += 1
            add_search_prompt(cur_lan_code, item['function_id'], item['semantic_id']);
            card.find('.copied-count-display').html(item['copied_count']);
            masonry_reload(display, '.prompt-col');

            setTimeout(() => {
                copy_btn.find('.bi').switchClass('bi-clipboard-check-fill', 'bi-clipboard');
            }, 2000);
        })
    });

    masonry_reload(display, '.prompt-col');
}

function gen_top_banner_item(image, url) {
    return $(`
        <div class="carousel-item rounded top-banner-item py-2 py-md-0 px-0 px-md-2">
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