import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { Post } from "../../post.model";
import { PostsService } from "../../posts.service";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated=false;
  currentPage = 1;
  userId: string;
  private authStatusSub: Subscription;

  private postSub: Subscription;

  constructor(
    public postsService: PostsService,
    public authService: AuthService
    ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    console.log(this.userId+"dsassad");
    // set up listener to the subject
    this.postSub = this.postsService
      .getPostUpateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
      this.userIsAuthenticated= this.authService.getIsAuth();
      this.authStatusSub=this.authService.getAuthStatusListener().subscribe(isAuthed=>{
        this.userIsAuthenticated= isAuthed;
        //  set userId if auth status change
        this.userId = this.authService.getUserId();
      });

  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, ()=>{
      this.isLoading=false;
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
