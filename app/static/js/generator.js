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

function gen_tool_card(tool_name, tool_desc, tool_url, tags, icon_src) {
    let tag_html = []
    tags.forEach(tag => {
        tag_html.push(`<div class="mdui-chip mdui-color-grey-300">
            <span class="mdui-chip-title">${tag}</span>
        </div>`);
    });
    tag_html = tag_html.join('\n');
    html = `
    <a href="${tool_url}" target="_blank" style="text-decoration: none;">
        <div class="mdui-card mdui-hoverable mdui-color-grey-200 mdui-m-b-2">
            <div class="mdui-card-primary">
                <div class="mdui-row mdui-p-x-2">
                <span class="mdui-typo-title mdui-m-r-1">${tool_name}</span>
                ${tag_html}
                <img class="mdui-chip-icon mdui-float-right" src="${icon_src}"/>
                </div>
                <div class="mdui-card-content">${tool_desc}</div>
            </div>
        </div>
    </a>
    `;
    return html;
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

            display.masonry({
                itemSelector: '.prompt-col',
                columnWidth: '.prompt-col',
                percentPosition: true
            }).masonry('reloadItems').masonry('layout');

            setTimeout(() => {
                copy_btn.find('.bi').switchClass('bi-clipboard-check-fill', 'bi-clipboard');
            }, 2000);
        })
    });

    display.masonry({
        itemSelector: '.prompt-col',
        columnWidth: '.prompt-col',
        percentPosition: true
    }).masonry('reloadItems').masonry('layout');
}

function gen_top_banner_item(image, url) {
    return $(`
        <div class="carousel-item rounded top-banner-item py-2 py-md-0">
            <div class="container-xxl">
                <img class="d-block w-100" src="${image}"></img>
            </div>
        </div>
    `)
}