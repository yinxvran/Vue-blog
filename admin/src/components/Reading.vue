<template>
    <div style="height: 100%">
        <head-nav></head-nav>
        <Aside></Aside>
        <div class="reading-list-container main">
            <transition name="slide-fade">
                <div class="dialog-container" v-show="isDiaShow"  @click="hideDialog($event)">
                    <section class="dialog">
                        <h5>输入书籍</h5>
                        <star id="score" :score="score"  @choose-star="chooseScore"></star>
                        <input type="text" id="name" placeholder="输入书籍名称..." v-model="editingName">
                        <input type="text" id="author" placeholder="输入作者..." v-model="editingAuthor">
                        <section class="btn-container">
                            <button id="confirm" class="not-del" @click="confirmChange">确认</button>
                            <button id="cancel" class="delete" @click="confirmCancel">取消</button>
                        </section>
                    </section>
                </div>
            </transition>
            <h2>阅读列表 /
                <span>READING LIST</span>
            </h2>
            <hr>
            <main>
                <section class="btn-container">
                    <button id="add" class="not-del" @click="addBook">添加书籍</button>
                </section>
                <table class="rd-list">
                    <tr>
                        <th>书名</th>
                        <th>作者</th>
                        <th>评分</th>
                        <th>编辑/删除</th>
                    </tr>
                    <tr v-for="({ name, author, score },index) in books" :key="index">
                        <td class="col-1">{{ name }}</td>
                        <td class="col-2">{{ author }}</td>
                        <td class="col-3">
                            <star :score="score"></star>
                        </td>
                        <td class="col-4">
                            <section class="btn-container">
                                <button id="edit" class="not-del" @click="editBook(index)">编辑</button>
                                <button id="delete" class="delete" @click="deleteBook(index)">删除</button>
                            </section>
                        </td>
                    </tr>
                </table>
            </main>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
// 引入头部和侧边导航组件
import HeadNav from '@/components/common/HeadNav'
import Aside from '@/components/common/Aside'
import Star from '@/components/common/Star'
export default {
    name: 'Reade',
    components: {
        Star,
        HeadNav,
        Aside
    },
    data() {
        return {
            books:[],
            isDiaShow: false,
            isEditing: false,
            score: 0,
            editingName: '',
            editingAuthor: '',
            editing: '',
            editingIndex: ''
        }
    },
    created () {
        request({
            url: '/readingBook',
            method: 'get',
        }).then(res=>{
            // console.log(res);
            this.books = res;
        }).catch(err=>{
            console.log(err);
        })
    },
    methods: {
        addBook () {
            this.isDiaShow = !this.isDiaShow
        },
        // 编辑书籍
        editBook (index) {
            // console.log(this.books[index])
            this.isDiaShow = !this.isDiaShow
            this.score = this.books[index].score
            this.editingName = this.books[index].name;
            this.editingAuthor = this.books[index].author; 
            this.editing = this.books[index].id;
            this.editingIndex = index
            this.isEditing = true
        },
        // 删除书籍
        deleteBook (index) {
            request({
                url: `/deletebook/${this.books[index].id}`,
                method: 'get'
            }).then(res=>{
                this.books.splice(index, 1)
            }).catch(err=>{
                console.log(err);
            })
        },
        // 更改书籍信息
        confirmChange () {
            const name = this.editingName,
                  author= this.editingAuthor,
                  score=  this.score;
            if(this.isEditing){
                request({
                    url: `/confirmUpdata/${this.editing}`,
                    method: 'post',
                    data: {
                        name: this.editingName,
                        author: this.editingAuthor,
                        score: this.score
                    }
                }).then(res=>{
                    const id = res.insertId;
                    this.books.splice(this.editingIndex, 1, {id, name, author, score});
                    this.isDiaShow = !this.isDiaShow;
                    this.isEditing = !this.isEditing;
                    this.editingName = "";
                    this.editingAuthor = "";
                    this.score = "";
                }).catch(err=>{
                    console.log(err);
                })
            }else{
                // 添加书籍信息
                if(this.editingName && this.editingAuthor && this.score != ''){
                    request({
                        url: '/addBook',
                        method: 'post',
                        data: {
                            name: this.editingName,
                            author: this.editingAuthor,
                            score: this.score
                        }
                    }).then(res=>{
                        const id = res.id;
                        const book = {
                                id: id,
                                name,
                                author,
                                score
                            }
                        this.isDiaShow = !this.isDiaShow;
                        this.books.push(book);
                        this.editingName = "";
                        this.editingAuthor = "";
                        this.score = "";
                    }).catch(err=>{
                        console.log(err);
                    })
                }else{
                     alert('输入信息不完整！')
                }
            }
        },
        confirmCancel () {
            this.isDiaShow = !this.isDiaShow;
            this.isEditing = false;
            this.isBookShow = false;
            this.editingName = "";
            this.editingAuthor = "";
            this.score = ""
        },
        hideDialog(evt) {
            if (evt.target.className === 'dialog-container' || evt.target.id === 'cancel') {
                this.isDiaShow = false
            }
        },
        chooseScore({evt, width}) {
            const offsetX = evt.offsetX
            // toFixed返回的是字符串...
            let score = (parseInt(evt.target.dataset.index, 10) + parseFloat(offsetX / width)).toFixed(2)
            if (score > 4.9) {
                score = 5
            }
            this.score = score
        },
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/style/variable";
main {
    height: calc(100% - 48px);
    padding: 0.5em 0;
    overflow: auto;
}
.bookErr {
    opacity: 0;
    background-color: red;
}
.rd-list {
    width: 100%;
    border-collapse: collapse;
    th {
        height: 3em;
        font-size: 1.6rem;
        border-bottom: 1px solid $word;
    }
    td {
        text-align: center;
        height: 4em;
        border-bottom: 1px dotted $word;
    }
    .col-1,
    .col-2,
    .col-4 {
        width: 20%;
        animation: reading .6s linear;
    }
    @keyframes reading {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    .col-2,
    .col-3 {
        border-left: 1px dotted $word;
        border-right: 1px dotted $word;
    }
}

.dialog-container {
    @include flex;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    min-width: 1024px;
    min-height: 100%;
    overflow: auto;
    background: rgba(0, 0, 0, 0.3);
    .dialog {
        @include flex($flow: column wrap, $justify: flex-start);
        width: 400px;
        height: 300px;
        background: $white;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
        border-top: 20px solid $base;
        border-radius: 5px;
        h5 {
            margin: 20px;
        }
        .star {
            margin-top: 0;
            /deep/ .star-item {
                width: 1.5em;
                height: 1.5em;
            }
        }
        input {
            margin-bottom: 15px;
            width: 200px;
            height: 2.5em;
            border-radius: 2px;
            border: 1px solid $special;
            outline-color: $base;
        }
        .btn-container {
            width: 200px;
            @include flex($justify: space-between);
        }
    }
}

.slide-fade-enter-active {
    transition: all 0.3s ease;
}
.slide-fade-leave-active {
    transition: all 0.6s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(-900px);
    opacity: 0;
}
</style>
