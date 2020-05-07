import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import {environment} from '../../environments/environment';


const BACKEND_URL=environment.apiUrl+ "/posts/";

@Injectable({
  providedIn: "root",
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  // we need listen to it
  getPostUpateListener() {
    return this.postsUpdated.asObservable();
  }

  // retriev the post
  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      // update locally the post array
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        //  we cannot edit posts in the service
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts,
        });
      });
  }

  addPost(title: string, content: string, image: File) {
    // json cannot send file!!! so we use form data
    // const post: Post ={id: null, title: title, content: content}
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http
      .post<{ message: string; post: Post }>(
        BACKEND_URL,
        postData
      )
      .subscribe((responseData) => {
        // const post: Post = {
        //   id: responseData.post.id,
        //   title: title,
        //   content: content,
        //   imagePath: responseData.post.imagePath,
        // };
        // this.posts.push(post);
        // // emitting here we want to listen to it
        // this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete(BACKEND_URL + postId);
      // .subscribe(() => {
      //   const updatedPosts = this.posts.filter((post) => post.id !== postId);
      //   this.posts = updatedPosts;
      //   this.postsUpdated.next([...this.posts]);
      // });
  }

  // get editing post  this can get data from the server
  getPost(id: string) {
    // before  return {...this.posts.find(p=>p.id====id)}  locally
    // after
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(BACKEND_URL + id);
  }

  // update a post  @Param() title, id, content
  // if image --string --> send json
  // if image -- object --> send formData
  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      //  case we dont upload file
      // string
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }

    this.http
      .put(BACKEND_URL + id, postData)
      // locally update the post
      .subscribe((res) => {
        // clone post array  doing this to automatically update the post list
        // const updatedPost = [...this.posts];
        // const oldPostIndex = updatedPost.findIndex((p) => p.id === id);
        // const post: Post = {
        //   id: id,
        //   title: title,
        //   content: content,
        //   imagePath: "",
        // };

        // updatedPost[oldPostIndex] = post;
        // this.posts = updatedPost;
        // this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }
}
